/**
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */
{
  let priceListsUpdated = [0, 0];
  let priceListActiveHour = -1;

  const onUpdate = async () => {
    try {
      if (state === undefined) {
        return;
      } else if (!state) {
        throw new Error("no data");
      }

      //Some shortcuts..
      let d = state;
      let s = d.s;
      let c = d.c;

      let todayPricesOK = d.p.length > 0;
      document.title = `${(s.dn ? `${s.dn} - ` : '')}Pörssisähkö`;

      qs("#s-cmd").innerHTML = s.cmd ? "PÄÄLLÄ" : "POIS";
      qs("#s-cmd").style.color = s.cmd ? "green" : "red";
      qs("#s-mode").innerHTML = MODE_STR[c.mode];
      qs("#s-dn").innerHTML = s.dn ? s.dn : '<i>Ei asetettu</i>';
      qs("#s-now").innerHTML = todayPricesOK ? `${s.p[0].now.toFixed(2)} c/kWh` : "";
      qs("#s-st").innerHTML = (s.st === 9
        ? STATE_STR[s.st].replace("%s", formatDateTime(new Date(s.fCmdTs * 1000), false))
        : STATE_STR[s.st]) + (c.inv ? " (käänteinen)" : "");
    
      if (s.str != "") {
        qs("#s-st").innerHTML += `<br><br>${s.str}`;
      }

      qs("#s-day").innerHTML = todayPricesOK ? `Keskiarvo: ${s.p[0].avg.toFixed(2)} c/kWh<br>Halvin: ${s.p[0].low.toFixed(2)} c/kWh<br>Kallein: ${s.p[0].high.toFixed(2)} c/kWh` : "";
      qs("#s-info").innerHTML = `${s.chkTs > 0 ? `Ohjaus tarkistettu ${formatTime(new Date(s.chkTs * 1000))}` : `Tarkistetaan ohjausta...`} - ${s.p[0].ts > 0 ? `hinnat haettu ${formatTime(new Date(s.p[0].ts * 1000))}` : "hintatietoja haetaan..."}`;
      qs("#s-v").innerHTML = `Käynnistetty ${formatDateTime(new Date(s.upTs * 1000))} (käynnissä ${((new Date().getTime() - new Date(s.upTs * 1000).getTime()) / 1000.0 / 60.0 / 60.0 / 24.0).toFixed("1")} päivää) - versio ${s.v}`;

      /**
       * Helper that builds price/cmd table for today or tomorrow 
       */
      const buildPriceList = (dayIndex, element) => {
        //Get cheapest hours
        //This is (and needs to be) 1:1 in both frontend and backend code
        let cheapest = [];
        
        if (d.p[dayIndex].length == 0) {
          element.innerHTML = `<tr><td colspan="3">Ei vielä tiedossa</td></tr>`;
          return;
        }

        if (c.mode === 2) {
          for (let i = 0; i < d.p[dayIndex].length; i += c.m2.per) {
            //Create array of indexes in selected period
            let order = [];

            for (let j = i; j < i + c.m2.per; j++) {
              //If we have less hours than 24 then skip the rest from the end
              if (j > d.p[dayIndex].length - 1)
                break;

              order.push(j);
            }

            if (c.m2.sq) {
              //Find cheapest in a sequence
              //Loop through each possible starting index and compare average prices
              let avg = 999;
              let startIndex = 0;

              for (let j = 0; j <= order.length - c.m2.cnt; j++) {
                let sum = 0;
                //Calculate sum of these sequential hours
                for (let k = j; k < j + c.m2.cnt; k++) {
                  sum += d.p[dayIndex][order[k]][1];
                };

                //If average price of these sequential hours is lower -> it's better
                if (sum / c.m2.cnt < avg) {
                  avg = sum / c.m2.cnt;
                  startIndex = j;
                }
              }

              for (let j = startIndex; j < startIndex + c.m2.cnt; j++) {
                cheapest.push(order[j]);
              }

            } else {
              //Sort indexes by price
              let j = 0;
              for (let k = 1; k < order.length; k++) {
                let temp = order[k];

                for (j = k - 1; j >= 0 && d.p[dayIndex][temp][1] < d.p[dayIndex][order[j]][1]; j--) {
                  order[j + 1] = order[j];
                }
                order[j + 1] = temp;
              }

              //Select the cheapest ones
              for (let j = 0; j < c.m2.cnt; j++) {
                cheapest.push(order[j]);
              }
            }

          }
        }

        //Price list
        if (priceListsUpdated[dayIndex] !== s.p[dayIndex].ts || (dayIndex == 0 && priceListActiveHour !== new Date().getHours())) {
          element.innerHTML = "";

          let per = 0;
          let bg = false;
          for (let i = 0; i < d.p[dayIndex].length; i++) {
            let row = d.p[dayIndex][i];
            let date = new Date(row[0] * 1000);
            let cmd =

              ((c.mode === 0 && c.m0.cmd)
                || (c.mode === 1 && row[1] <= (c.m1.lim == "avg" ? s.p[dayIndex].avg : c.m1.lim))
                || (c.mode === 2 && cheapest.includes(i) && row[1] <= (c.m2.m == "avg" ? s.p[dayIndex].avg : c.m2.m))
                || (c.mode === 2 && row[1] <= (c.m2.lim == "avg" ? s.p[dayIndex].avg : c.m2.lim))
                || ((c.fh & (1 << i)) == (1 << i) && (c.fhCmd & (1 << i)) == (1 << i)))
              && !((c.fh & (1 << i)) == (1 << i) && (c.fhCmd & (1 << i)) == 0);

            //Invert
            if (c.inv) {
              cmd = !cmd;
            }

            if (i >= per + c.m2.per) {
              //Period changed
              per += c.m2.per;
              bg = !bg;
            }

            let data = `<tr style="${date.getHours() === new Date().getHours() && dayIndex == 0 ? `font-weight:bold;` : ``}${(bg ? "background:#ededed;" : "")}">`;
            data += `<td class="fit">${formatTime(date, false)}</td>`;
            data += `<td>${row[1].toFixed(2)} c/kWh</td>`;
            data += `<td>${cmd ? "&#x2714;" : ""}</td>`;
            data += `</tr>`;

            element.innerHTML += data;
          }

          //Only if today
          if(dayIndex == 0) {
            priceListActiveHour = new Date().getHours();
          }
          priceListsUpdated[dayIndex] = s.p[dayIndex].ts;
        }

        return s.p[dayIndex].ts;
      }

      //Creating price/cmd tables for today and tomorror
      buildPriceList(0, qs("#s-p0"));
      buildPriceList(1, qs("#s-p1"));


    } catch (err) {
      console.error(err);
      let c = (e) => qs(e).innerHTML = "";
      qs("#s-cmd").innerHTML = "Tila ei tiedossa";
      qs("#s-cmd").style.color = "red";
      c("#s-dn");
      c("#s-now");
      c("#s-mode");
      c("#s-p0");
      c("#s-p1");
      c("#s-info");
      c("#s-st");

    }
  };

  onUpdate();
  CBS.push(onUpdate);
}
(() => {
  let isUseAPI = undefined;

  const inDevelopment = () => {
    return ["local", "localhost"].some(val => window.location.hostname.includes(val)) ||
      !["kefi", "matakailcommunication.com", "kefi.matakailcommunication.com"].some(val => window.location.hostname.includes(val))
  }

  const inProduction = () => {
    return !inDevelopment();
  }

  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  }

  // to translate months
  const MONTHS = {
    "1": "Januari",
    "2": "Februari",
    "3": "Maret",
    "4": "April",
    "5": "Mei",
    "6": "Juni",
    "7": "Juli",
    "8": "Agustus",
    "9": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Desember",
  }

  // utility for parsing number into rupiah currency
  const parseToRupiah = (number, options = {}) => {
    const { locales, ...opts } = options;
    return new Intl.NumberFormat(locales || "id", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
      ...opts,
    }).format(number)
      .substring(3) // remove "Rp "
    // .replace(decimal ? /(\.+\d{2})/ : "", "");
  }

  // parse indonesia date string from csv into iso date
  const reverseDate = (dateString = "") => dateString.split("-").reverse().join("-");

  // create pdf
  const generatePdfUrl = async (dataPenjualan) => {
    const doc = new jspdf.jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const masaPajak = `${dataPenjualan.fixedDataArray[0].date.split("-")[0]} ${MONTHS[Number(dataPenjualan.fixedDataArray[0].date.split("-")[1])]} - ${dataPenjualan.fixedDataArray[dataPenjualan.fixedDataArray.length - 1].date.split("-")[0]} ${MONTHS[Number(dataPenjualan.fixedDataArray[dataPenjualan.fixedDataArray.length - 1].date.split("-")[1])]} ${dataPenjualan.fixedDataArray[dataPenjualan.fixedDataArray.length - 1].date.split("-")[2]}`;
    const fileName = `Laporan Pajak Kefi ${masaPajak}.pdf`;

    // html of result format
    let laporanHTMLString = `
  <body>
  <div class="">
    <style>
      .wrapper * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .wrapper {
        padding: 1cm 2cm;
        font-size: 12pt;
        width: 190mm;
        margin: auto;
        display: flex;
        align-items: center;
        flex-direction: column;
        font-family: initial;
      }

      .wrapper h1 {
        text-transform: uppercase;
        font-size: 16pt;
        text-align: center;
        margin-bottom: 1rem;
        font-weight: bold;
        line-height: 1;
      }

      .wrapper p {
        margin-bottom: 0;
        line-height: 1.2;
      }

      .wrapper .info-wrapper {
        width: 100%;
        text-align: left;
        margin-bottom: 1.2rem;
      }

      .wrapper .info-wrapper>div {
        display: flex;
      }

      .wrapper .info-wrapper>div>p:first-child {
        width: 100px;
      }

      .wrapper .info-wrapper>div>p:nth-child(2) {
        width: 15px;
      }

      .wrapper .info-wrapper>div>p:last-child {
        flex: 1 1 0;
      }
      
      .wrapper table {
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
        border: 1px solid;
        text-align: center;
        margin-bottom: 1rem;
      }

      .wrapper td,
      .wrapper th {
        padding: 1px 8px;
        border: 1px solid;
      }

      .wrapper td {
        font-size: 10pt;
      }

      .wrapper th {
        font-size: 11pt;
      }

      .wrapper td:not(:first-child) {
        text-align: right;
      }

      .wrapper tbody tr:last-child {
        font-weight: bold;
      }

      .wrapper td .currency-number {
        display: flex;
        justify-content: space-between;
      }

      .sign-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .sign-wrapper p:last-child {
        margin-top: 100px;
      }

      .sign-wrapper p:last-child span {
        display: inline-block;
        width: 170px;
      }

    </style>

    <div class="wrapper">

      <h1>Laporan Penjualan Harian</h1>

      <div class="info-wrapper">
        <div>
          <p>NPWPD</p>
          <p>:</p>
          <p>400271791303</p>
        </div>
        <div>
          <p>Nama Usaha</p>
          <p>:</p>
          <p>Kefi Cafe and Space</p>
        </div>
        <div>
          <p>Alamat</p>
          <p>:</p>
          <p>Jl. Abdul Hakim Komp. Classic II</p>
        </div>
        <div>
          <p>Masa Pajak</p>
          <p>:</p>
          <p>${masaPajak}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>
              Tanggal
            </th>
            <th>
              Total Penjualan Harian
            </th>
            <th>
              Pajak Restoran 10%
            </th>
          </tr>
        </thead>
        <tbody>
          ${dataPenjualan.fixedDataArray.map((fixedData) => {
      const [date, month, year] = fixedData.date.split("-");
      const parsedDate = `${date} ${MONTHS[Number(month)]} ${year}`;
      const parsedTotalCollectedNoVat = parseToRupiah(fixedData.totalCollectedNoVat);
      const parsedVat = parseToRupiah(fixedData.totalVat);
      return `<tr><td>${parsedDate}</td><td><div class="currency-number"><span>Rp</span> <span>${parsedTotalCollectedNoVat}</span></td><td><div class="currency-number"><span>Rp</span> <span>${parsedVat}</span></td></tr>`

      // show total + vat
      // const parsedTotalCollected = parseToRupiah(fixedData.totalCollectedNoVat + fixedData.totalVat);
      // return `<tr><td>${parsedDate}</td><td><div class="currency-number"><span>Rp</span> <span>${parsedTotalCollectedNoVat}</span></td><td><div class="currency-number"><span>Rp</span> <span>${parsedVat}</span></td><td><div class="currency-number"><span>Rp</span> <span>${parsedTotalCollected}</span></td></tr>`
      // <tr><td>Total</td><td><div class="currency-number"><span>Rp</span> <span>${parseToRupiah(dataPenjualan.totalCollectedNoVatCumulative)}</span></td><td><div class="currency-number"><span>Rp</span> <span>${parseToRupiah(dataPenjualan.totalVatCumulative)}</span></td><td><div class="currency-number"><span>Rp</span> <span>${parseToRupiah(dataPenjualan.totalCollectedNoVatCumulative + dataPenjualan.totalVatCumulative)}</span></td></tr>

    })}
          <tr><td>Total</td><td><div class="currency-number"><span>Rp</span> <span>${parseToRupiah(dataPenjualan.totalCollectedNoVatCumulative)}</span></td><td><div class="currency-number"><span>Rp</span> <span>${parseToRupiah(dataPenjualan.totalVatCumulative)}</span></td></tr>
        </tbody>
      </table>

      <div class="sign-wrapper">
        <p>Medan, .........................................</p>
        <p>Henny Pandiangan</p>
      </div>
      
    </div>
  </div>
</body>
  `

    const laporanHTMLElement = new DOMParser().parseFromString(laporanHTMLString, "text/html").querySelector("body>div");

    // remove extra unwanted content ,,,,,,,,,,
    const fourthContent = laporanHTMLElement.querySelector(".wrapper").childNodes[4];
    fourthContent.textContent.includes(",,,,,,,,,,") && fourthContent.remove();

    await doc.html(laporanHTMLElement, {
      x: 0,
      y: 0,
      width: 210,
      windowWidth: 800,
    });

    const dataBlob = doc.output("blob");
    const fileData = new File([dataBlob], fileName, {
      lastModified: Date.now(),
      type: dataBlob.type,
    });

    const url = URL.createObjectURL(fileData);

    return { url, fileName, laporanHTMLElement };
  }

  // create array with required data from raw csv
  const createDataArray = ({ rawCSVData = [], mokaDataArray = [] }) => {

    // if using file upload, change rawCSVData object into required mokaDataArray object
    if (rawCSVData.length > 0 && mokaDataArray.length === 0) {
      // for debugging
      if (inDevelopment()) {
        window.dataResult = rawCSVData.map((d) => {
          return {
            date: d["Date"],
            time: d["Time"],
            grossSales: d["Gross Sales"],
            discounts: d["Discounts"],
            refunds: d["Refunds"],
            netSales: d["Net Sales"],
            gratuity: d["Gratuity"],
            tax: d["Tax"],
            totalCollected: d["Total Collected"],
            otherNoteOptional: d["Other Note(Optional)"],
            receiptNumber: d["Receipt Number"],
            collectedBy: d["Collected By"],
            servedBy: d["Served By"],
            customer: d["Customer"],
            customerPhone: d["Customer Phone"],
            items: d["Items"],
            paymentMethod: d["Payment Method"],
            eventType: d["Event Type"],
            reasonOfRefund: d["Reason of Refund"],
          }
        })
      }

      // window.dtes = [];
      rawCSVData.forEach((d) => {
        let netSales = d["Net Sales"];
        let vat = d["Tax"];
        if (Number(d["Tax"]) === 0 && Number(d["Net Sales"]) > 0) {
          // window.dtes.push(d);
          netSales = (netSales / 110) * 100;
          vat = netSales * (10 / 100);
        }
        mokaDataArray.push({
          date: d["Date"],
          netSales,
          gratuity: d["Gratuity"],
          vat,
          totalCollected: d["Total Collected"],
        })
      });

      //
      // // group data per day
      // // reportPerDay[year][month][dayofmonth] = [payments]
      // const csvReportPerDay = { [ev.target.year.value]: { [Number(ev.target.month.value)]: {} } }
      // for (let i = 1; i <= lastSelectedDayOfMonth; i++) {
      //   csvReportPerDay[ev.target.year.value][Number(ev.target.month.value)][i] = result.data.payments.filter((payment) => {
      //     return new Date(payment.parent_payment_created_at).getDate() === i
      //   })
      // }

      // window.csvReportPerDay = csvReportPerDay;

    } else if ((rawCSVData.length > 0 && mokaDataArray.length > 0) || (rawCSVData.length === 0 && mokaDataArray.length === 0)) {
      // if both are empty or both are exist, throw error
      throw new Error("Please use one of the mode");
    }

    // rumus:
    /*
          total penjualan net   +   total servis      =   total pendapatan
        ( total net sales       +   total gratuity    =   total collected   )
    
          total pendapatan      *   10%               =   total pajak
        ( total collected       *   10/100            =   totalVat          )
  
        if vat === 0
        net sales + gratuity = total collected with vat
        net sales + gratuity / 110 * 100 = total collected 
        (net sales + gratuity / 110 * 100) * 10%  = vat
    */


    // format
    // fixedDataArray = [
    //   {
    //     date: "yyyy-mm-dd",
    //     totalCollectedNoVat: "",
    //     totalVat: "",
    //   },
    // ];
    // group data per day
    const fixedDataArray = [];
    let fixedDataIndexFlag = 0;
    let totalCollectedNoVatCumulative = 0;
    let totalVatCumulative = 0;

    mokaDataArray.forEach((mokaData, mokaDataIdx) => {
      const totalCollectedNoVatInt = Number(mokaData.netSales) + Number(mokaData.gratuity);
      // const totalVatInt = Number(mokaData.vat);
      const totalVatInt = totalCollectedNoVatInt * (10 / 100);

      // set total cumulative
      totalCollectedNoVatCumulative += totalCollectedNoVatInt;
      totalVatCumulative += totalVatInt;

      // new array format
      if (mokaDataIdx === 0) {
        // first item
        fixedDataArray[fixedDataIndexFlag] = {
          date: mokaData.date,
          totalCollectedNoVat: totalCollectedNoVatInt,
          totalVat: totalVatInt,
        }
      } else if (mokaData.date === mokaDataArray[mokaDataIdx - 1].date) {
        // sum totalCollected per date
        fixedDataArray[fixedDataIndexFlag].totalCollectedNoVat += totalCollectedNoVatInt;
        fixedDataArray[fixedDataIndexFlag].totalVat += totalVatInt;
      } else if (mokaData.date !== mokaDataArray[mokaDataIdx - 1].date) {
        // add new item (new date)
        fixedDataIndexFlag++;
        fixedDataArray[fixedDataIndexFlag] = {
          date: mokaData.date,
          totalCollectedNoVat: totalCollectedNoVatInt,
          totalVat: totalVatInt,
        }
      }
    })

    // round all number data
    fixedDataArray.forEach((fixedData) => {
      fixedData.totalCollectedNoVat = Math.round(fixedData.totalCollectedNoVat);
      fixedData.totalVat = Math.round(fixedData.totalVat);
    })

    // sort by date ascending
    fixedDataArray.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split("-");
      const [dayB, monthB, yearB] = b.date.split("-");
      return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
    })

    // fill empty date
    const currentSelectedYear = fixedDataArray[0].date.split("-")[2];
    const currentSelectedMonth = fixedDataArray[0].date.split("-")[1];
    const filledDataArray = [];
    for (let day = 1; day <= getLastDayOfMonth(currentSelectedYear, currentSelectedMonth); day++) {
      // get fixed data array by date
      const data = fixedDataArray.filter((val) => val.date.split("-")[0] === day.toString().padStart(2, "0"));

      if (!data.length > 0) {
        // if (fixedDataArray[day - 1].date.split("-")[0] === day.toString().padStart(2, "0")) {
        filledDataArray.push({
          date: `${day.toString().padStart(2, "0")}-${currentSelectedMonth}-${currentSelectedYear}`,
          totalCollectedNoVat: 0,
          totalVat: 0,
        })
      } else {
        filledDataArray.push(data[0]);
      }
    }

    if (inDevelopment()) {
      window.fixedDataArray = fixedDataArray;
      window.filledDataArray = filledDataArray;
    }

    return { fixedDataArray: filledDataArray, totalCollectedNoVatCumulative: Math.round(totalCollectedNoVatCumulative), totalVatCumulative: Math.round(totalVatCumulative) };
  }

  // start creating pdf
  const startCreatePDF = ({ textData, mokaDataArray }, { uploadButton, divHasilPDF, divBtnWrapper, divIframeWrapper, divHasilHTML, divHTMLWrapper, separator }) => {
    if (textData && mokaDataArray) {
      throw new Error("Cannot start creating pdf when both source are exist");
    } else if (!textData && !mokaDataArray) {
      throw new Error("Cannot start creating pdf when both source are empty");
    }

    // parse csv
    // const rawCSVData = d3.csvParse(textData);
    // rawDataFromCSV = csvData;

    // create required data
    const dataPenjualan = textData ? createDataArray({ rawCSVData: d3.csvParse(textData) }) : createDataArray({ mokaDataArray });

    // create pdf
    return generatePdfUrl(dataPenjualan).then(({ url, fileName, laporanHTMLElement }) => {


      // pdf preview
      const iframeElement = document.createElement("iframe");
      iframeElement.setAttribute("src", url);
      iframeElement.setAttribute("title", fileName);
      iframeElement.style.width = "100%";
      iframeElement.style.height = "90vh";

      // new tab preview button
      const newTabPreviewButton = document.createElement("a");
      newTabPreviewButton.href = url;
      newTabPreviewButton.target = "_blank";

      newTabPreviewButton.className = "btn btn-outline-secondary flex-grow-1 flex-sm-grow-0";
      newTabPreviewButton.innerText = "Buka di Tab Baru";

      // download button
      const downloadButton = document.createElement("a");
      downloadButton.href = url;
      downloadButton.download = fileName;

      downloadButton.className = "btn btn-success flex-grow-1 flex-sm-grow-0";
      downloadButton.innerText = "Download Laporan";

      divHasilPDF.querySelector("div:first-child").innerHTML = "<h3>Hasil PDF</h3>";
      divBtnWrapper.appendChild(newTabPreviewButton);
      divBtnWrapper.appendChild(downloadButton);

      divIframeWrapper.appendChild(iframeElement);

      // line separation
      separator.forEach(el => el.innerHTML = "<hr />");

      // html preview
      divHasilHTML.querySelector("div:first-child").innerHTML = "<h3>Hasil Pratinjau HTML</h3>";
      divHTMLWrapper.appendChild(laporanHTMLElement);

      uploadButton.removeAttribute("disabled");
      uploadButton.innerText = "Buat Laporan";
    }).catch((err) => {
      alert("Something wrong. Please double check the file");
      console.error(err);
      uploadButton.removeAttribute("disabled");
      uploadButton.innerText = "Buat Laporan";
    }).finally(() => {
      return;
    })
  }

  // on form submit
  const handlerSubmit = (e) => {
    e.preventDefault();

    isUseAPI = false;

    const uploadButton = uploadMokaCSVForm.querySelector(".submit-btn");

    uploadButton.setAttribute("disabled", "disabled");
    uploadButton.innerText = "Memproses ...";

    // button dan hasil
    const divHasilPDF = document.getElementById("hasil-pdf");
    const divBtnWrapper = divHasilPDF.querySelector(".btn-wrapper");
    const divIframeWrapper = divHasilPDF.querySelector(".iframe-wrapper");

    const divHasilHTML = document.getElementById("hasil-html");
    const divHTMLWrapper = divHasilHTML.querySelector(".html-wrapper");

    const separator = document.querySelectorAll(".separator");

    // reset preview
    divHasilPDF.querySelector("div:first-child").innerHTML = "";
    divBtnWrapper.innerHTML = "";
    divIframeWrapper.innerHTML = "";

    divHasilHTML.querySelector("div:first-child").innerHTML = "";
    divHTMLWrapper.innerHTML = "";

    separator.forEach(el => el.innerHTML = "");
    // end of reset preview

    const fileInputData = document.getElementById("mokaFileInput");

    const mokaFile = fileInputData.files[0];

    const startProcess = performance.now();

    if (mokaFile.name.split(".").pop() === "zip" || ["application/x-zip-compressed", "application/zip"].includes(mokaFile.type)) {
      // read zip file
      JSZip.loadAsync(mokaFile).then((zip) => {

        let zipFileName = [];

        zip.forEach((relativePath, zipEntry) => {
          zipFileName.push(zipEntry.name);
        });

        // use first file in zip
        // if it is csv
        if (zipFileName[0].split(".").pop() === "csv") {
          zip.file(zipFileName[0]).async("string").then((result) => {
            startCreatePDF({ textData: result }, { uploadButton, divHasilPDF, divBtnWrapper, divIframeWrapper, divHasilHTML, divHTMLWrapper, separator })
              .finally(() => {
                const endProcess = performance.now();
                console.log("data processed! " + (endProcess - startProcess) + " ms");
              })
          });
        } else {
          throw new Error("Cannot use this file. Please double check the file");
        }

      }
      ).catch((err) => {
        alert(err.message || err);
        console.error(err.message || err);
        console.log("File: ", mokaFile);
        uploadButton.removeAttribute("disabled");
        uploadButton.innerText = "Buat Laporan";
      })
    } else if (mokaFile.name.split(".").pop() === "csv" || mokaFile.type === "text/csv") {

      const reader = new FileReader();

      reader.readAsText(mokaFile);

      reader.onload = function (e) {
        startCreatePDF({ textData: e.target.result }, { uploadButton, divHasilPDF, divBtnWrapper, divIframeWrapper, divHasilHTML, divHTMLWrapper, separator })
          .finally(() => {
            const endProcess = performance.now();
            console.log("data processed! " + (endProcess - startProcess) + " ms");
          })
      };

    } else {
      console.error("Cannot use current file.");
      console.log("File: ", mokaFile);
      uploadButton.removeAttribute("disabled");
      uploadButton.innerText = "Buat Laporan";
    }

  }

  const uploadMokaCSVForm = document.getElementById("uploadMokaCSVForm");

  uploadMokaCSVForm.addEventListener("submit", handlerSubmit);

  //

  const getReportSubmitHandler = (ev) => {

    ev.preventDefault();

    isUseAPI = true;

    // alert("Fitur belum tersedia. Mohon gunakan metode lainnya.");
    // return;

    // disable button while generating
    const getReportBtn = getReport.querySelector(".submit-btn");

    getReportBtn.setAttribute("disabled", "disabled");
    getReportBtn.innerText = "Memproses ...";

    // disable form inputs

    // button dan hasil
    const divHasilPDF = document.getElementById("hasil-pdf");
    const divBtnWrapper = divHasilPDF.querySelector(".btn-wrapper");
    const divIframeWrapper = divHasilPDF.querySelector(".iframe-wrapper");

    const divHasilHTML = document.getElementById("hasil-html");
    const divHTMLWrapper = divHasilHTML.querySelector(".html-wrapper");

    const separator = document.querySelectorAll(".separator");

    // reset preview
    divHasilPDF.querySelector("div:first-child").innerHTML = "";
    divBtnWrapper.innerHTML = "";
    divIframeWrapper.innerHTML = "";

    divHasilHTML.querySelector("div:first-child").innerHTML = "";
    divHTMLWrapper.innerHTML = "";

    separator.forEach(el => el.innerHTML = "");
    // end of reset preview

    // handle input
    const selectedDate = new Date(`${ev.target.year.value}-${ev.target.month.value}`);
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth() + 1;
    const lastSelectedDayOfMonth = getLastDayOfMonth(selectedYear, selectedMonth);
    const since = selectedDate.getTime() / 1000;
    const until = (new Date(selectedYear, selectedMonth, 0).getTime() / 1000) + 86340;

    // get per day
    // let selectedDate = new Date(`${ev.target.year.value}-${ev.target.month.value}-06`);
    // let selectedYear = selectedDate.getFullYear();
    // let selectedMonth = selectedDate.getMonth() + 1;
    // let lastSelectedDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    // let since = selectedDate.getTime() / 1000;
    // let until = since + 86340;

    let myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer ccd2aab9d7f077b9055a8bd78108aff3184037599d83d5fdf501758bb9e73967");
    // get non cached 
    // myHeaders.append('pragma', 'no-cache');
    // myHeaders.append('cache-control', 'no-cache');

    let requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    const queryString = new URLSearchParams({
      since,
      until,
      time_filter: "created_at",
      include_promo: true,
      exclude_bundle: false,
    })

    let API_URL = "https://api.mokapos.com/v3/outlets/511011/reports/get_latest_transactions";

    if (inDevelopment() && !confirm("Use MOKA API")) {
      // if (confirm("Include Promo?")) {
      //   API_URL = "/sample/api-data-sample-include-promo.json";
      // } else {
      //   API_URL = "/sample/api-data-sample.json";
      // }
      getReportBtn.removeAttribute("disabled");
      getReportBtn.innerText = "Buat Laporan";
      return;
    }

    const startFetch = performance.now();
    console.log("fetching data...");

    let startProcess;

    const getData = async (urlData, reqOptionsData) => {

      const resultTotal = {
        fetchResult: [],
        data: { payments: [] },
      };

      const getDataRecursive = async (url, reqOptions) => {
        return await fetch(url, reqOptions).then(response => response.json())
          .then(async result => {

            if (result.data.payments && result.data.payments.length > 1) {
              resultTotal.data.payments.push(...result.data.payments);
            }

            resultTotal.fetchResult.push(result);

            if (!result.data.completed && result.data.next_url) {
              // console.log("fetching more...");
              await getDataRecursive(result.data.next_url, reqOptions);
            } else {
              // console.log("done");
              return;
            }
          })
          .catch(error => {
            console.error(error.message || error);
            return;
          })
      }

      await getDataRecursive(urlData, reqOptionsData);
      return resultTotal;
    }

    // fetch(`${API_URL}?${queryString}`, requestOptions)
    // .then(response => response.json())

    getData(`${API_URL}?${queryString}`, requestOptions)
      .then(result => {
        const endFetch = performance.now();
        console.log("data fetched! ", endFetch - startFetch);
        startProcess = performance.now();
        console.log("processing data...");

        if (inDevelopment()) {
          window.fetchResult = result;
          window.transactionList = [];

          // lib

          // group data per day
          // reportPerDay[year][month][dayofmonth] = [payments]
          const reportPerDay = { [ev.target.year.value]: { [Number(ev.target.month.value)]: {} } }
          for (let i = 1; i <= lastSelectedDayOfMonth; i++) {
            reportPerDay[ev.target.year.value][Number(ev.target.month.value)][i] = result.data.payments.filter((payment) => {
              return new Date(payment.parent_payment_created_at).getDate() === i
            })
          }

          window.reportPerDay = reportPerDay;

          // get sold items per day
          // reportPerDay[year][month][dayOfMonth].reduce((a, payment) => {
          //   return a + payment.checkouts.map(item => item.quantity).reduce((a, b) => a + b, 0)
          // }, 0)

          // get total sold items
          // fetchResult.data.payments.reduce((a, payment) => {
          //   return a + payment.checkouts.map(item => item.quantity).reduce((a, b) => a + b, 0)
          // }, 0)

          // get total collected 
          // fetchResult.data.payments.reduce((a, c) => { return a + c.total_collected }, 0)

          // generate json file of result
          // const jsonData = JSON.stringify(result, undefined, "  ");
          // const dataBlob = new Blob([jsonData], { type: "application/json" });
          // const blobURL = URL.createObjectURL(dataBlob);
          // const a = document.createElement('a');
          // a.href = blobURL;
          // a.download = "api-data-sample.json";
          // a.click();

        }

        // TODO
        // get data per item checkouts
        /*
            payment.checkouts.map((item)=>{
              item.gross_sales
              item.
            })
        */

        // create required array source

        let mokaDataArray = []

        // filter refunded data, then loop
        result.data.payments.filter(payment => payment.total_refund === 0).forEach((payment) => {

          // fix empty taxes because tax disabled when using other online order payment method (grabfood/gojek/dll)
          let netSales = payment.subtotal;
          let vat = payment.taxes;

          if (payment.taxes === 0) {
            netSales = (netSales / 110) * 100;
            vat = netSales * (10 / 100);
          }

          if (inDevelopment()) {
            const transactionData = {
              paymentType: payment.payment_type,
              items: payment.checkouts,
              timestamp: payment.parent_payment_created_at,
              netsales: netSales,
              discounts: payment.discounts,
              gratuities: payment.gratuities,
              tax: vat,
              totalCollected: payment.total_collected,
              originalObject: {
                payment_type: payment.payment_type,
                checkouts: payment.checkouts,
                parent_payment_created_at: payment.parent_payment_created_at,
                subtotal: payment.subtotal,
                discounts: payment.discounts,
                gratuities: payment.gratuities,
                taxes: vat,
                total_collected: payment.total_collected,
              }
            }

            window.transactionList.push(transactionData);
          }

          const requiredSource = {
            timestamp: payment.parent_payment_created_at,
            date: [
              new Date(payment.parent_payment_created_at).getDate().toString().padStart(2, "0"),
              (new Date(payment.parent_payment_created_at).getMonth() + 1).toString().padStart(2, "0"),
              new Date(payment.parent_payment_created_at).getFullYear()
            ].join("-"),
            netSales,
            gratuity: payment.gratuities,
            vat,
            totalCollected: payment.total_collected,
          }

          mokaDataArray.push(requiredSource);
        });

        return startCreatePDF({ mokaDataArray }, { uploadButton: getReportBtn, divHasilPDF, divBtnWrapper, divIframeWrapper, divHasilHTML, divHTMLWrapper, separator });
      })
      .catch((err) => {
        console.error(err.message || err);
        getReportBtn.removeAttribute("disabled");
        getReportBtn.innerText = "Buat Laporan";
      })
      .finally(() => {
        const endProcess = performance.now();
        console.log("data processed! " + (endProcess - startProcess) + " ms");

        //   // enable button after generating is done
        //   getReportBtn.removeAttribute("disabled");
        //   getReportBtn.innerText = "Buat Laporan";

        //   // enable form inputs

      });
  }

  const getReport = document.getElementById("getReport");

  getReport.addEventListener("submit", getReportSubmitHandler);

  // set month to last month, and current or last year
  getReport.querySelector("#month").value = new Date(new Date().getFullYear(), new Date().getMonth() - 1).getMonth() + 1;
  // console.log(new Date(new Date().getFullYear(), new Date().getMonth() - 1).getMonth() + 1)
  getReport.querySelector("#year").value = new Date(new Date().getFullYear(), new Date().getMonth() - 1).getFullYear();
  // console.log(new Date(new Date().getFullYear(), new Date().getMonth() - 1).getFullYear())

})()
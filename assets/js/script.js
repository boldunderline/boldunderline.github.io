(function () {

  // variables
  let prizes = [];
  const spinBtn = document.querySelector(".hc-luckywheel-btn");

  // menu
  // change fullscreen mode
  const fullscreenBtn = document.querySelector("a[href='#fullscreen']");

  const changeFullScreenText = (ev) => {
    if (!document.fullscreenElement) {
      fullscreenBtn.innerText = "Fullscreen";
    } else {
      fullscreenBtn.innerText = "Exit Fullscreen";
    }
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  fullscreenBtn.addEventListener("click", function (ev) {
    ev.preventDefault();
    toggleFullScreen();
  })

  window.addEventListener("fullscreenchange", changeFullScreenText);

  // upload button
  const uploadBtn = document.querySelector("a[href='#upload-data']");

  uploadBtn.addEventListener("click", function (ev) {
    ev.preventDefault();

    // save data to local storage
    function saveData(ev) {
      ev.preventDefault();
      const fileInput = Swal.getPopup().querySelector("#datalist");

      if (fileInput.files.length === 0) {
        Swal.showValidationMessage("Please upload file");
        return;
      }

      const file = fileInput.files[0];

      const reader = new FileReader();

      reader.onload = function (event) {
        const data = event.target.result;

        const workbook = XLSX.read(data, {
          type: 'binary'
        });

        workbook.SheetNames.forEach(function (sheetName) {
          const dataList = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
          const dataListJSON = JSON.stringify(dataList);
          localStorage.setItem("datalist", dataListJSON)
          localStorage.removeItem("winnerlist");
        });

        initLuckyWheel(ev);
        ev.target.reset()
        Swal.close()
      };

      reader.onerror = function (event) {
        Swal.showValidationMessage("File could not be read! Try to upload again")
        console.error("File could not be read! Code " + event.target.error.code);
      };

      reader.readAsBinaryString(file);
    }
    // end of save data to local storage

    Swal.fire({
      title: "Upload Data",
      showConfirmButton: false,
      showCloseButton: true,
      allowOutsideClick: typeof localStorage.getItem("datalist") === "string",
      allowEscapeKey: typeof localStorage.getItem("datalist") === "string",
      html: `
        <form id="configForm">
          <div class="m-2 mb-4">
            <input type="file" class="form-control" name="datalist" id="datalist" accept=".xls, .xlsx, .csv">
            <p class="form-text">Accept excel ( .xlx | .xlsx ), or .csv file</p>
          </div>
          <div>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      `,
      didRender: () => {
        const configForm = Swal.getPopup().querySelector("#configForm");
        configForm.addEventListener("submit", saveData);
      },
    })

  })

  // reset winner data
  const resetWinnerBtn = document.querySelector("a[href='#reset']");

  resetWinnerBtn.addEventListener("click", function (ev) {
    ev.preventDefault();
    Swal.fire({
      title: "Reset winner?",
      text: "This will reset winner list without losing participant list. Continue?",
      icon: "warning",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      customClass: {
        confirmButton: "btn btn-danger me-3",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("winnerlist")
        initLuckyWheel(ev);
      }
    })
  })

  // delete data
  const deleteListBtn = document.querySelector("a[href='#delete']");

  deleteListBtn.addEventListener("click", function (ev) {
    ev.preventDefault();
    Swal.fire({
      title: "Delete all list?",
      text: "This will delete all participant and winner list. Continue?",
      icon: "warning",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      customClass: {
        confirmButton: "btn btn-danger me-3",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // remove data list
        localStorage.removeItem("winnerlist")
        localStorage.removeItem("datalist")
        // clear canvas
        const canvas = document.querySelector(".hc-luckywheel-canvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // remove names list
        const prizeItemsContainer = document.querySelector(".hc-luckywheel-list");
        prizeItemsContainer && document.querySelector(".hc-luckywheel-container").removeChild(prizeItemsContainer);
        // remove data in prizes
        prizes = [];
        // disable spin button
        spinBtn.classList.add("disabled");
      }
    })
  })

  // see participant list
  const participantListBtn = document.querySelector("a[href='#participant-list']");

  participantListBtn.addEventListener("click", function (ev) {
    ev.preventDefault();

    const pList = localStorage.getItem("datalist") !== null || typeof localStorage.getItem("datalist") === "string" ? JSON.parse(localStorage.getItem("datalist")) : [];

    // open left drawer
    Swal.fire({
      title: 'List of Participants',
      position: 'top-start',
      showClass: {
        popup: `
          animate__animated
          animate__fadeInLeft
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutLeft
          animate__faster
        `
      },
      showConfirmButton: pList.length === 0,
      confirmButtonText: "Upload data",
      customClass: {
        confirmButton: "btn btn-primary me-3",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      showCancelButton: true,
      cancelButtonText: "Close",
      showCloseButton: true,
      didRender: (pop) => {

        const popEl = pop.querySelector(".swal2-html-container .table");

        const tableBody = document.createElement("tbody");
        pList.length > 0 ? pList.forEach((p, idx) => {
          const rowItem = document.createElement("tr");
          rowItem.innerHTML = `<td>${++idx}.</td><td>${p?.text ?? p["NAMA"] ?? p["Nama"] ?? p["nama"] ?? p["NAME"] ?? p["Name"] ?? p["name"] ?? ""}</td><td class="text-end">${p.nik ?? ""}</td>`;
          tableBody.appendChild(rowItem);
        }) : tableBody.innerHTML = "<tr><td class='text-center'>No Participant Yet</td></tr>";
        popEl.appendChild(tableBody);

        popEl.style.display = "block";
      },
      html: `<table class="d-table table table-borderless text-start"></table>`,
    }).then((result) => {
      if (result.isConfirmed) {
        uploadBtn.click();
      }
    });
  });

  // see winner list
  const winnerListBtn = document.querySelector("a[href='#winner-list']");

  winnerListBtn.addEventListener("click", function (ev) {
    ev.preventDefault();

    // open left drawer
    Swal.fire({
      title: 'List of Winner',
      position: 'top-start',
      showClass: {
        popup: `
          animate__animated
          animate__fadeInLeft
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutLeft
          animate__faster
        `
      },
      customClass: {
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Close",
      showCloseButton: true,
      didRender: (pop) => {
        const wList = localStorage.getItem("winnerlist") !== null || typeof localStorage.getItem("winnerlist") === "string" ? JSON.parse(localStorage.getItem("winnerlist")) : [];

        const popEl = pop.querySelector(".swal2-html-container .table");

        const tableBody = document.createElement("tbody");
        wList.length > 0 ? wList.forEach((w, idx) => {
          const rowItem = document.createElement("tr");
          rowItem.innerHTML = `<td>${++idx}.</td><td>${w.text ?? ""}</td><td class="text-end">${w.nik ?? ""}</td>`;
          tableBody.appendChild(rowItem);
        }) : tableBody.innerHTML = "<tr><td class='text-center'>No Winner Yet</td></tr>";
        popEl.appendChild(tableBody);

        popEl.style.display = "block";
      },
      html: `<table class="d-table table table-borderless text-start"></table>`,
    });
  });



  // luckywheel
  let isPercentage = false;

  // load file from contohdata.xlsx
  function loadListNama(path = "./contohdata.xlsx") {
    return new Promise(function (resolve, reject) {

      spinBtn.classList.add("disabled");

      // load from localStorage

      if (localStorage.getItem("datalist") !== null || typeof localStorage.getItem("datalist") === "string") {
        let data = JSON.parse(localStorage.getItem("datalist"));

        data.length > 0 && spinBtn.classList.remove("disabled");

        const fileData = data.map((dl) => {
          return {
            text: dl["NAMA"] ?? dl["Nama"] ?? dl["nama"] ?? dl["NAME"] ?? dl["Name"] ?? dl["name"],
            nik: dl["NIK"] ?? dl["Nik"] ?? dl["nik"],
            number: 1,
          }
        })
        resolve(fileData)
      } else {
        // reject("Mohon Upload Data Peserta");

        // load using xhr
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {

          /* convert data to binary string */
          let arraybuffer = xhr.response;
          let dataUint8Arr = new Uint8Array(arraybuffer);
          let arr = new Array();
          for (let i = 0; i != dataUint8Arr.length; ++i) {
            arr[i] = String.fromCharCode(dataUint8Arr[i])
          };
          let bstr = arr.join("");

          const workbook = XLSX.read(bstr, {
            type: "binary"
          });

          let dataL = [];

          workbook.SheetNames.forEach(function (sheetName) {
            const dataList = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            dataL = dataList;
          });

          console.log(dataL)
          const dataListJSON = JSON.stringify(dataL);
          localStorage.setItem("datalist", dataListJSON)
          // localStorage.removeItem("winnerlist");

          const fileData = dataL.map((dl) => {
            return {
              text: dl["NAMA"] ?? dl["Nama"] ?? dl["nama"] ?? dl["NAME"] ?? dl["Name"] ?? dl["name"],
              nik: dl["NIK"] ?? dl["Nik"] ?? dl["nik"],
              number: 1,
            }
          })

          spinBtn.classList.remove("disabled");

          resolve(fileData);



          // if (xhr.readyState == 4) {
          //   // The request is done; did it work?
          //   if (xhr.status == 200) {
          //     // Yes, use `xhr.responseText` to resolve the promise
          //     // console.log(xhr)
          //     // console.log(xhr.response)
          //     // console.log(xhr.responseText)
          //     // const fileData = xhr.responseText.replaceAll("\r", "").split("\n").map((namaPeserta) => {
          //     //   return {
          //     //     text: namaPeserta,
          //     //     number: 1,
          //     //   }
          //     // });

          //     
          //   } else {
          //     // No, reject the promise
          //     reject(xhr);
          //   }
          // }
        };
        xhr.open("GET", path);
        xhr.responseType = "arraybuffer";
        xhr.send();
      }
    });
  }

  // initiate lucky wheel
  function initLuckyWheel(ev) {

    loadListNama()
      .then(function (fileData) {
        // Use the file data
        prizes = fileData;

        hcLuckywheel.init({
          id: "luckywheel",
          config: function (callback) {
            callback &&
              callback(prizes);
          },
          mode: null,
          getPrize: function (callback) {
            let rand = randomIndex(prizes);
            let chances = rand;
            callback && callback([rand, chances]);
          },
          gotBack: function (winnerData, winnerDataId) {
            // show popup
            if (winnerData === null) {
              Swal.fire({
                title: 'Empty Data',
                icon: 'error',
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {
                  confirmButton: "btn btn-light",
                },
                buttonsStyling: false,
              })
            } else if (winnerData.text === 'Good luck next time') {
              Swal.fire({
                title: 'You missed it! Good luck next time',
                icon: 'error',
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {
                  confirmButton: "btn btn-light",
                },
                buttonsStyling: false,
              })
            } else {
              // show confetti
              window.initConfetti();

              Swal.fire({
                title: 'Congratulation!',
                position: "top",
                html: `<p class="fs-2 fw-bold text-uppercase" style="color: #022575">${winnerData.text}</p><p class="fs-4 fw-bold" style="color: #022575">${winnerData.nik ?? ""}</p>`,
                // icon: 'success',
                didDestroy: () => {
                  window.removeConfetti();
                },
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {
                  confirmButton: "btn btn-light text-reset",
                },
                buttonsStyling: false,
              })
            }

            // set winner list
            const currentWinnerList = localStorage.getItem("winnerlist") !== null || typeof localStorage.getItem("winnerlist") === "string" ? JSON.parse(localStorage.getItem("winnerlist")) : [];
            currentWinnerList.push(fileData[winnerDataId]);

            const winnerList = JSON.stringify(currentWinnerList);
            localStorage.setItem("winnerlist", winnerList);
          },
        });
      })
      .catch(function (err) {
        // The call failed, look at `err` for details
        console.error("error", err);
        if (err === "Mohon Upload Data Peserta") {
          uploadBtn.click();
          return;
        }

        Swal.fire({
          title: err,
          icon: "error",
          position: "top-end",
          customClass: {
            confirmButton: "btn btn-primary",
          },
          buttonsStyling: false,
        })
      });
  }

  // on load document
  document.addEventListener(
    "DOMContentLoaded",
    initLuckyWheel,
    false
  );
  function randomIndex(prizes) {
    if (isPercentage) {
      let counter = 1;
      for (let i = 0; i < prizes.length; i++) {
        if (prizes[i].number == 0) {
          counter++
        }
      }
      if (counter == prizes.length) {
        return null
      }
      let rand = Math.random();
      let prizeIndex = null;
      switch (true) {
        case rand < prizes[4].percentpage:
          prizeIndex = 4;
          break;
        case rand < prizes[4].percentpage + prizes[3].percentpage:
          prizeIndex = 3;
          break;
        case rand < prizes[4].percentpage + prizes[3].percentpage + prizes[2].percentpage:
          prizeIndex = 2;
          break;
        case rand < prizes[4].percentpage + prizes[3].percentpage + prizes[2].percentpage + prizes[1].percentpage:
          prizeIndex = 1;
          break;
        case rand < prizes[4].percentpage + prizes[3].percentpage + prizes[2].percentpage + prizes[1].percentpage + prizes[0].percentpage:
          prizeIndex = 0;
          break;
      }
      if (prizes[prizeIndex].number != 0) {
        prizes[prizeIndex].number = prizes[prizeIndex].number - 1
        return prizeIndex
      } else {
        return randomIndex(prizes)
      }
    } else {

      let counter = 0;
      for (let i = 0; i < prizes.length; i++) {
        if (prizes[i].number == 0) {
          counter++;
        }
      }
      if (counter == prizes.length) {
        return null
      }
      let rand = (Math.random() * (prizes.length)) >>> 0;
      if (prizes[rand].number != 0) {
        prizes[rand].number = prizes[rand].number - 1;
        return rand;
      } else {
        return randomIndex(prizes)
      }
    }
  }
})();
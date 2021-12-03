//FOLDER SELECTOR CLICK HANDLERS
$(document).ready(() => {
  $("#confirm-account-settings").click(() => {
    $("#guided-splash").hide();
    $("#guided-steps").hide();
  });

  $("#button-user-no-files").click(() => {
    $("#folder-inquiry-prompt").text(
      "Do you have any primary files you would like to add to your dataset?"
    );
    $("#folder-explanation").text("Some examples might be foo bar.");
    $("#primary-card").css({
      opacity: "1",
    });
    $("#code-card").css({
      opacity: "0.2",
    });
    $("#code-card").toggleClass("checked");
  });

  $("#code-card").click(() => {
    console.log(app);
    alert("I need to be handled");
  });
  $("#primary-card").click(() => {
    alert("I need to be handled");
  });
  $("#source-card").click(() => {
    alert("I need to be handled");
  });
  $("#docs-card").click(() => {
    alert("I need to be handled");
  });
  $("#protocol-card").click(() => {
    alert("I need to be handled");
  });
  $("#derivative-card").click(() => {
    alert("I need to be handled");
  });

  $("#button-user-has-files").click(() => {
    alert("I will take you to the code folder organization page");
  });

  $("#create-pennsieve-dataset").click(() => {
    $("#nav-select-folders").click();
    /*
    setTimeout(() => {
      let pennsieveSelectedAccount = defaultBfAccount;
      let pennsieveNewDatasetName = $("#pennsieve-dataset-name").val();

      log.info(
        `Creating a new dataset with the name: ${pennsieveNewDatasetName}`
      );

      $("#button-create-pennsieve-dataset").prop("disabled", true);

      Swal.fire({
        title: `Creating a new dataset named: ${pennsieveNewDatasetName}`,
        html: "Please wait...",
        // timer: 5000,
        allowEscapeKey: false,
        allowOutsideClick: false,
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
        timerProgressBar: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      client.invoke(
        "api_bf_new_dataset_folder",
        pennsieveNewDatasetName,
        pennsieveSelectedAccount,
        (error, res) => {
          if (error) {
            log.error(error);
            console.error(error);
            let emessage = userError(error);

            Swal.fire({
              title: `Failed to create a new dataset.`,
              text: emessage,
              showCancelButton: false,
              heightAuto: false,
              backdrop: "rgba(0,0,0, 0.4)",
              icon: "error",
            });

            $("#button-create-pennsieve-dataset").prop("disabled", false);

            ipcRenderer.send(
              "track-event",
              "Error",
              "Manage Dataset - Create Empty Dataset",
              pennsieveNewDatasetName
            );
          } else {
            Swal.fire({
              title: `Dataset ${pennsieveNewDatasetName} was created successfully`,
              icon: "success",
              showConfirmButton: true,
              heightAuto: false,
              backdrop: "rgba(0,0,0, 0.4)",
              didOpen: () => {
                Swal.hideLoading();
              },
            });

            log.info(`Created dataset successfully`);

            $("#button-create-pennsieve-dataset").hide();

            defaultBfDataset = pennsieveNewDatasetName;
            refreshDatasetList();
            currentDatasetPermission.innerHTML = "";
            currentAddEditDatasetPermission.innerHTML = "";
            $("#button-create-pennsieve-dataset").prop("disabled", false);

            addNewDatasetToList(pennsieveNewDatasetName);
            ipcRenderer.send(
              "track-event",
              "Success",
              "Manage Dataset - Create Empty Dataset",
              pennsieveNewDatasetName
            );

            log.info(`Requesting list of datasets`);

            client.invoke(
              "api_bf_dataset_account",
              defaultBfAccount,
              (error, result) => {
                if (error) {
                  log.error(error);
                  console.log(error);
                } else {
                  log.info(`Requested list of datasets successfully`);
                  datasetList = [];
                  datasetList = result;
                }
              }
            );
            $(".bf-dataset-span").html(pennsieveNewDatasetName);

            refreshDatasetList();
            updateDatasetList();

            $(".confirm-button").click();
            $("#bf-new-dataset-name").val("");
          }
        }
      );
    }, delayAnimation);
  */
  });
});

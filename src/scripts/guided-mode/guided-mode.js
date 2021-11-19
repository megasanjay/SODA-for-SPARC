  let imageType = "";

  if (!fs.existsSync(imageFolder)) {
    fs.mkdirSync(imageFolder, { recursive: true });
  }

  if (imageExtension == "png") {
    imageType = "image/png";
  } else {
    imageType = "image/jpeg";
  }

  let imagePath = path.join(imageFolder, "banner-image-SODA." + imageExtension);
  let croppedImageDataURI = myCropper.getCroppedCanvas().toDataURL(imageType);

  imageDataURI.outputFile(croppedImageDataURI, imagePath).then(() => {
    let image_file_size = fs.statSync(imagePath)["size"];

    if (image_file_size < 5 * 1024 * 1024) {
      let selectedBfAccount = defaultBfAccount;
      let selectedBfDataset = defaultBfDataset;

      client.invoke(
        "api_bf_add_banner_image",
        selectedBfAccount,
        selectedBfDataset,
        imagePath,
        (error, res) => {
          if (error) {
            log.error(error);
            console.error(error);
            let emessage = userError(error);

            $("#para-dataset-banner-image-status").html(
              "<span style='color: red;'> " + emessage + "</span>"
            );

            ipcRenderer.send(
              "track-event",
              "Error",
              "Manage Dataset - Upload Banner Image",
              selectedBfDataset,
              image_file_size
            );
          } else {
            $("#para-dataset-banner-image-status").html(res);

            showCurrentBannerImage();

            $("#edit_banner_image_modal").modal("hide");

            ipcRenderer.send(
              "track-event",
              "Success",
              "Manage Dataset - Upload Banner Image",
              selectedBfDataset,
              image_file_size
            );
          }
        }
      );
    } else {
      $("#para-dataset-banner-image-status").html(
        "<span style='color: red;'> " +
          "Final image size must be less than 5 MB" +
          "</span>"
      );
    }
  });
};

$("#save-banner-image").click((event) => {
  $("#para-dataset-banner-image-status").html("");
  if (bfViewImportedImage.src.length > 0) {
    if (formBannerHeight.value > 511) {
      Swal.fire({
        icon: "warning",
        text: `As per NIH guidelines, banner image must not display animals or graphic/bloody tissues. Do you confirm that?`,
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
        showCancelButton: true,
        focusCancel: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        reverseButtons: reverseSwalButtons,
        showClass: {
          popup: "animate__animated animate__zoomIn animate__faster",
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut animate__faster",
        },
      }).then((result) => {
        if (formBannerHeight.value < 1024) {
          Swal.fire({
            icon: "warning",
            text: `Although not mandatory, it is highly recommended to upload a banner image with display size of at least 1024 px. Your cropped image is ${formBannerHeight.value} px. Would you like to continue?`,
            heightAuto: false,
            backdrop: "rgba(0,0,0, 0.4)",
            showCancelButton: true,
            focusCancel: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            reverseButtons: reverseSwalButtons,
            showClass: {
              popup: "animate__animated animate__zoomIn animate__faster",
            },
            hideClass: {
              popup: "animate__animated animate__zoomOut animate__faster",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              uploadBannerImage();
            }
          });
        } else {
          uploadBannerImage();
        }
      });
    } else {
      $("#para-dataset-banner-image-status").html(
        "<span style='color: red;'> " +
          "Dimensions of cropped area must be at least 512 px" +
          "</span>"
      );
    }
  } else {
    $("#para-dataset-banner-image-status").html(
      "<span style='color: red;'> " + "Please import an image first" + "</span>"
    );
  }
});

$(document).ready(() => {
  ipcRenderer.on("selected-banner-image", async (event, path) => {
    if (path.length > 0) {
      let original_image_path = path[0];
      let image_path = original_image_path;
      let destination_image_path = require("path").join(
        homeDirectory,
        "SODA",
        "banner-image-conversion"
      );
      let converted_image_file = require("path").join(
        destination_image_path,
        "converted-tiff.jpg"
      );
      let conversion_success = true;
      imageExtension = path[0].split(".").pop();

      if (imageExtension.toLowerCase() == "tiff") {
        $("body").addClass("waiting");
        Swal.fire({
          title: "Image conversion in progress!",
          html: "Pennsieve does not support .tiff banner images. Please wait while SODA converts your image to the appropriate format required.",
          heightAuto: false,
          backdrop: "rgba(0,0,0, 0.4)",
          showClass: {
            popup: "animate__animated animate__fadeInDown animate__faster",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp animate__faster",
          },
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await Jimp.read(original_image_path)
          .then(async (file) => {
            console.log("starting tiff conversion");
            if (!fs.existsSync(destination_image_path)) {
              fs.mkdirSync(destination_image_path);
            }

            try {
              if (fs.existsSync(converted_image_file)) {
                fs.unlinkSync(converted_image_file);
              }
            } catch (err) {
              conversion_success = false;
              console.error(err);
            }

            return file.write(converted_image_file, async () => {
              if (fs.existsSync(converted_image_file)) {
                let stats = fs.statSync(converted_image_file);
                let fileSizeInBytes = stats.size;
                let fileSizeInMegabytes = fileSizeInBytes / (1000 * 1000);

                if (fileSizeInMegabytes > 5) {
                  console.log("File size too large. Resizing image");

                  fs.unlinkSync(converted_image_file);

                  await Jimp.read(original_image_path)
                    .then((file) => {
                      return file
                        .resize(1024, 1024)
                        .write(converted_image_file, () => {
                          document.getElementById(
                            "div-img-container-holder"
                          ).style.display = "none";
                          document.getElementById(
                            "div-img-container"
                          ).style.display = "block";

                          $("#para-path-image").html(image_path);
                          bfViewImportedImage.src = converted_image_file;
                          myCropper.destroy();
                          myCropper = new Cropper(
                            bfViewImportedImage,
                            cropOptions
                          );
                          $("#save-banner-image").css("visibility", "visible");
                          $("body").removeClass("waiting");
                        });
                    })
                    .catch((err) => {
                      conversion_success = false;
                      console.error(err);
                    });
                  if (fs.existsSync(converted_image_file)) {
                    let stats = fs.statSync(converted_image_file);
                    let fileSizeInBytes = stats.size;
                    let fileSizeInMegabytes = fileSizeInBytes / (1000 * 1000);

                    if (fileSizeInMegabytes > 5) {
                      console.log("File size is too big", fileSizeInMegabytes);
                      conversion_success = false;
                      // SHOW ERROR
                    }
                  }
                }
                console.log("file conversion complete");
                image_path = converted_image_file;
                imageExtension = "jpg";
                $("#para-path-image").html(image_path);
                bfViewImportedImage.src = image_path;
                myCropper.destroy();
                myCropper = new Cropper(bfViewImportedImage, cropOptions);
                $("#save-banner-image").css("visibility", "visible");
              }
            });
          })
          .catch((err) => {
            conversion_success = false;
            console.error(err);
            Swal.fire({
              icon: "error",
              text: "Something went wrong",
              confirmButtonText: "OK",
              heightAuto: false,
              backdrop: "rgba(0,0,0, 0.4)",
            });
          });
        if (conversion_success == false) {
          $("body").removeClass("waiting");
          return;
        } else {
          Swal.close();
        }
      } else {
        document.getElementById("div-img-container-holder").style.display =
          "none";
        document.getElementById("div-img-container").style.display = "block";

        $("#para-path-image").html(image_path);
        bfViewImportedImage.src = image_path;
        myCropper.destroy();
        myCropper = new Cropper(bfViewImportedImage, cropOptions);

        $("#save-banner-image").css("visibility", "visible");
      }
    } else {
      if ($("#para-current-banner-img").text() === "None") {
        $("#save-banner-image").css("visibility", "hidden");
      } else {
        $("#save-banner-image").css("visibility", "visible");
      }
    }
  });

  ipcRenderer.on("show-banner-image-below-1024", (event, index) => {
    if (index === 0) {
      uploadBannerImage();
    }
  });
});

const showCurrentBannerImage = () => {
  var selectedBfAccount = defaultBfAccount;
  var selectedBfDataset = defaultBfDataset;

  if (selectedBfDataset === "Select dataset") {
    $("#banner_image_loader").hide();

    bfCurrentBannerImg.src = "";
    document.getElementById("para-current-banner-img").innerHTML = "None";
    bfViewImportedImage.src = "";

    $("#div-img-container-holder").css("display", "block");
    $("#div-img-container").css("display", "none");
    $("#save-banner-image").css("visibility", "hidden");

    myCropper.destroy();
  } else {
    $("#banner_image_loader").show();

    document.getElementById("para-current-banner-img").innerHTML = "";

    client.invoke(
      "api_bf_get_banner_image",
      selectedBfAccount,
      selectedBfDataset,
      (error, res) => {
        if (error) {
          log.error(error);
          console.error(error);

          $("#banner_image_loader").hide();

          bfCurrentBannerImg.src = "assets/img/no-banner-image.png";
          document.getElementById("para-current-banner-img").innerHTML = "None";
          bfViewImportedImage.src = "";

          $("#div-img-container-holder").css("display", "block");
          $("#div-img-container").css("display", "none");
          $("#save-banner-image").css("visibility", "hidden");

          myCropper.destroy();
        } else {
          if (res === "No banner image") {
            bfCurrentBannerImg.src = "";
            document.getElementById("para-current-banner-img").innerHTML =
              "None";
            bfViewImportedImage.src = "";

            $("#div-img-container-holder").css("display", "block");
            $("#div-img-container").css("display", "none");
            $("#save-banner-image").css("visibility", "hidden");

            myCropper.destroy();
          } else {
            document.getElementById("para-current-banner-img").innerHTML = "";
            bfCurrentBannerImg.src = res;
          }
          $("#banner_image_loader").hide();
        }
      }
    );
  }
};

// Add tags //

// add or edit metadata tags for a user's selected dataset in the "add/edit tags" section of the manage-dataset menu
$("#button-add-tags").click(async () => {
  Swal.fire({
    title: determineSwalLoadingMessage($("#button-add-tags")),
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
  }).then((result) => {});

  // get the current tags from the input inside of the manage_datasets.html file inside of the tags section
  const tags = Array.from(datasetTagsTagify.getTagElms()).map((tag) => {
    return tag.textContent;
  });

  // get the name of the currently selected dataset
  var selectedBfDataset = defaultBfDataset;

  // Add tags to dataset
  try {
    await update_dataset_tags(selectedBfDataset, tags);
  } catch (e) {
    // log the error
    log.error(e);
    console.error(e);
    // alert the user of the error
    Swal.fire({
      title: "Failed to edit your dataset tags!",
      icon: "error",
      text: e.message,
      showConfirmButton: true,
      heightAuto: false,
      backdrop: "rgba(0,0,0, 0.4)",
    });

    // halt execution
    return;
  }
  // show success or failure to the user in a popup message
  Swal.fire({
    title: determineSwalSuccessMessage($("#button-add-tags")),
    icon: "success",
    showConfirmButton: true,
    heightAuto: false,
    backdrop: "rgba(0,0,0, 0.4)",
  }).then(
    //check if tags array is empty and set Add/Edit tags appropriately
    tags === undefined || tags.length == 0
      ? $("#button-add-tags").html("Add tags")
      : $("#button-add-tags").html("Edit tags")
  );
});

// fetch a user's metadata tags
// this function fires from two events:
//    1. when a user clicks on the pencil icon to view their list of datasets in any of the manage-dataset sections
//    2. after the user selects a dataset from the very same dropdown list
const showCurrentTags = async () => {
  var selectedBfAccount = defaultBfAccount;
  var selectedBfDataset = defaultBfDataset;

  if (selectedBfDataset === "Select dataset") {
    // this code executes when the pencil icon that allows a user to select a dataset is clicked in the tags section
    // for now do nothing
  } else {
    // remove all of the tags from the current input
    datasetTagsTagify.removeAllTags();

    // make the tags input display a loading spinner after a user selects a new dataset
    datasetTagsTagify.loading(true);

    // get the tags from the Pennsieve API
    let tags;
    try {
      tags = await get_dataset_tags(selectedBfDataset);
      if (tags === undefined || tags.length == 0) {
        //if so make the button say add tags
        $("#button-add-tags").html("Add tags");
      } else {
        //make the button say edit tags
        $("#button-add-tags").html("Edit tags");
      }
    } catch (e) {
      // log the error
      log.error(e);
      console.error(e);
      // alert the user of the error
      Swal.fire({
        title: "Failed to retrieve your selected dataset!",
        icon: "error",
        text: e.message,
        showConfirmButton: true,
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
      });

      // stop the loader -- no data can be fetched for this dataset
      datasetTagsTagify.loading(false);

      // halt execution
      return;
    }

    // stop displaying the tag loading spinner
    datasetTagsTagify.loading(false);

    // display the retrieved tags
    datasetTagsTagify.addTags(tags);
  }
};

// Add license //
$("#button-add-license").click(() => {
  setTimeout(function () {
    Swal.fire({
      title: "Adding license to dataset",
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

    let selectedBfAccount = defaultBfAccount;
    let selectedBfDataset = defaultBfDataset;
    let selectedLicense = "Creative Commons Attribution";

    client.invoke(
      "api_bf_add_license",
      selectedBfAccount,
      selectedBfDataset,
      selectedLicense,
      (error, res) => {
        if (error) {
          log.error(error);
          console.error(error);

          let emessage = userError(error);

          Swal.fire({
            title: "Failed to add the license to your dataset!",
            text: emessage,
            icon: "error",
            showConfirmButton: true,
            heightAuto: false,
            backdrop: "rgba(0,0,0, 0.4)",
          });

          ipcRenderer.send(
            "track-event",
            "Error",
            "Manage Dataset - Assign License",
            selectedBfDataset
          );
        } else {
          Swal.fire({
            title: "Successfully added license to dataset!",
            icon: "success",
            showConfirmButton: true,
            heightAuto: false,
            backdrop: "rgba(0,0,0, 0.4)",
          });

          showCurrentLicense();

          ipcRenderer.send(
            "track-event",
            "Success",
            "Manage Dataset - Assign License",
            selectedBfDataset
          );
        }
      }
    );
  }, delayAnimation);
});

const showCurrentLicense = () => {
  var selectedBfAccount = defaultBfAccount;
  var selectedBfDataset = defaultBfDataset;

  currentDatasetLicense.innerHTML = `Loading current license... <div class="ui active green inline loader tiny"></div>`;

  if (selectedBfDataset === "Select dataset") {
    currentDatasetLicense.innerHTML = "None";
  } else {
    client.invoke(
      "api_bf_get_license",
      selectedBfAccount,
      selectedBfDataset,
      (error, res) => {
        if (error) {
          log.error(error);
          console.error(error);
        } else {
          currentDatasetLicense.innerHTML = res;
          if (res === "Creative Commons Attribution") {
            $("#button-add-license").hide();
            $("#assign-a-license-header").hide();
            if ($("#add_license-section").hasClass("is-shown")) {
              Swal.fire({
                title:
                  "You are all set. This dataset already has the correct license assigned.",
                backdrop: "rgba(0,0,0, 0.4)",
                heightAuto: false,
                showConfirmButton: true,
                icon: "success",
              });
            }
          } else {
            $("#button-add-license").show();
            $("#assign-a-license-header").show();
          }
        }
      }
    );
  }
};

$("#selected-local-dataset-submit").click(() => {
  ipcRenderer.send("open-file-dialog-submit-dataset");
});

$(document).ready(() => {
  ipcRenderer.on("selected-submit-dataset", (event, filepath) => {
    if (filepath.length > 0) {
      if (filepath != null) {
        $("#selected-local-dataset-submit").attr(
          "placeholder",
          `${filepath[0]}`
        );

        valid_dataset = verify_sparc_folder(filepath[0]);

        if (valid_dataset == true) {
          $("#button_upload_local_folder_confirm").click();
          $("#button-submit-dataset").show();
          $("#button-submit-dataset").addClass("pulse-blue");

          // remove pulse class after 4 seconds
          // pulse animation lasts 2 seconds => 2 pulses
          setTimeout(() => {
            $(".pulse-blue").removeClass("pulse-blue");
          }, 4000);
        } else {
          Swal.fire({
            icon: "warning",
            text: "This folder does not seems to be a SPARC dataset folder. Are you sure you want to proceed?",
            heightAuto: false,
            backdrop: "rgba(0,0,0, 0.4)",
            showCancelButton: true,
            focusCancel: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
            reverseButtons: reverseSwalButtons,
            showClass: {
              popup: "animate__animated animate__zoomIn animate__faster",
            },
            hideClass: {
              popup: "animate__animated animate__zoomOut animate__faster",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              $("#button_upload_local_folder_confirm").click();
              $("#button-submit-dataset").show();
              $("#button-submit-dataset").addClass("pulse-blue");

              // remove pulse class after 4 seconds
              // pulse animation lasts 2 seconds => 2 pulses
              setTimeout(() => {
                $(".pulse-blue").removeClass("pulse-blue");
              }, 4000);
            } else {
              $("#input-destination-getting-started-locally").attr(
                "placeholder",
                "Browse here"
              );
              $("#selected-local-dataset-submit").attr(
                "placeholder",
                "Browse here"
              );
            }
          });
        }
      }
    }
  });
});

function walk(directory, filepaths = []) {
  const files = fs.readdirSync(directory);
  for (let filename of files) {
    const filepath = path.join(directory, filename);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filepaths);
    } else {
      filepaths.push(filepath);
    }
  }
  return filepaths;
}

const logFilesForUpload = (upload_folder_path) => {
  const foundFiles = walk(upload_folder_path);
  foundFiles.forEach((item) => {
    log.info(item);
  });
};

// Submit dataset to bf //
$("#button-submit-dataset").click(async () => {
  $("#para-please-wait-manage-dataset").html(
    "Please wait while we verify a few things..."
  );

  let supplementary_checks = await run_pre_flight_checks(false);
  if (!supplementary_checks) {
    return;
  }

  var totalFileSize;

  $("#para-please-wait-manage-dataset").html("Please wait...");
  $("#para-progress-bar-error-status").html("");

  progressBarUploadBf.value = 0;

  $("#button-submit-dataset").prop("disabled", true);
  $("#selected-local-dataset-submit").prop("disabled", true);
  $("#button-submit-dataset").popover("hide");
  $("#progress-bar-status").html("Preparing files ...");

  var err = false;
  var completionStatus = "Solving";
  var selectedbfaccount = defaultBfAccount;
  var selectedbfdataset = defaultBfDataset;

  log.info("Files selected for upload:");
  logFilesForUpload(pathSubmitDataset.placeholder);

  client.invoke(
    "api_bf_submit_dataset",
    selectedbfaccount,
    selectedbfdataset,
    pathSubmitDataset.placeholder,
    (error, res) => {
      if (error) {
        let emessage = userError(error);

        $("#para-please-wait-manage-dataset").html("");
        $("#para-progress-bar-status").html("");
        $("#div-progress-submit").css("display", "none");
        $("#para-progress-bar-error-status").html(
          "<span style='color: red;'>" + emessage + sadCan + "</span>"
        );

        progressBarUploadBf.value = 0;

        err = true;
        log.error(error);
        console.error(error);

        ipcRenderer.send(
          "track-event",
          "Error",
          "Manage Dataset - Upload Local Dataset",
          selectedbfdataset
        );

        $("#upload_local_dataset_progress_div")[0].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        $("#button-submit-dataset").prop("disabled", false);
        $("#selected-local-dataset-submit").prop("disabled", false);
      } else {
        $("#upload_local_dataset_progress_div")[0].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        log.info("Completed submit function");
        console.log("Completed submit function");

        ipcRenderer.send(
          "track-event",
          "Success",
          "Manage Dataset - Upload Local Dataset - name - size",
          defaultBfDataset,
          totalFileSize
        );

        ipcRenderer.send(
          "track-event",
          "Success",
          "Upload Local Dataset - size",
          totalFileSize
        );

        ipcRenderer.send(
          "track-event",
          "Success",
          `Upload Local Dataset - ${selectedbfdataset} - size`,
          totalFileSize
        );

        client.invoke(
          "api_get_number_of_files_and_folders_locally",
          pathSubmitDataset.placeholder,
          (error, res) => {
            if (error) {
              log.error(error);
              console.error(error);
            } else {
              let num_of_files = res[0];
              let num_of_folders = res[1];

              ipcRenderer.send(
                "track-event",
                "Success",
                `Upload Local Dataset - ${defaultBfDataset} - Number of Folders`,
                num_of_folders
              );

              ipcRenderer.send(
                "track-event",
                "Success",
                `Upload Local Dataset - Number of Folders`,
                num_of_folders
              );

              ipcRenderer.send(
                "track-event",
                "Success",
                `Manage Dataset - Upload Local Dataset - name - Number of files`,
                defaultBfDataset,
                num_of_files
              );

              ipcRenderer.send(
                "track-event",
                "Success",
                `Upload Local Dataset - ${defaultBfDataset} - Number of Files`,
                num_of_files
              );

              ipcRenderer.send(
                "track-event",
                "Success",
                `Upload Local Dataset - Number of Files`,
                num_of_files
              );
            }
          }
        );
      }
    }
  );

  var countDone = 0;
  var timerProgress = setInterval(progressfunction, 1000);

  function progressfunction() {
    $("#upload_local_dataset_progress_div")[0].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    client.invoke("api_submit_dataset_progress", (error, res) => {
      if (error) {
        let emessage = userError(error);

        log.error(error);
        console.error(error);

        $("#para-progress-bar-error-status").html(
          "<span style='color: red;'>" + emessage + sadCan + "</span>"
        );
      } else {
        completionStatus = res[1];
        let submitprintstatus = res[2];
        totalFileSize = res[3];
        let uploadedFileSize = res[4];

        if (submitprintstatus === "Uploading") {
          $("#div-progress-submit").css("display", "block");

          if (res[0].includes("Success: COMPLETED!")) {
            progressBarUploadBf.value = 100;

            $("#para-please-wait-manage-dataset").html("");
            $("#para-progress-bar-status").html(res[0] + smileyCan);
          } else {
            var value = (uploadedFileSize / totalFileSize) * 100;

            progressBarUploadBf.value = value;

            if (totalFileSize < displaySize) {
              var totalSizePrint = totalFileSize.toFixed(2) + " B";
            } else if (totalFileSize < displaySize * displaySize) {
              var totalSizePrint =
                (totalFileSize / displaySize).toFixed(2) + " KB";
            } else if (
              totalFileSize <
              displaySize * displaySize * displaySize
            ) {
              var totalSizePrint =
                (totalFileSize / displaySize / displaySize).toFixed(2) + " MB";
            } else {
              var totalSizePrint =
                (
                  totalFileSize /
                  displaySize /
                  displaySize /
                  displaySize
                ).toFixed(2) + " GB";
            }

            $("#para-please-wait-manage-dataset").html("");
            $("#para-progress-bar-status").html(
              res[0] +
                "Progress: " +
                value.toFixed(2) +
                "%" +
                " (total size: " +
                totalSizePrint +
                ")"
            );
          }
        }
      }
    });
    if (completionStatus === "Done") {
      countDone++;

      if (countDone > 1) {
        log.info("Done submit track");
        console.log("Done submit track");

        clearInterval(timerProgress);

        $("#para-please-wait-manage-dataset").html("");

        $("#button-submit-dataset").prop("disabled", false);
        $("#selected-local-dataset-submit").prop("disabled", false);
      }
    }
  }
});

const addRadioOption = (ul, text, val) => {
  let li = document.createElement("li");
  let element = `<input type="radio" id="${val}_radio" value="${val}" name="dataset_status_radio"/> <label for="${val}_radio">${text}</label> <div class="check"></div>`;
  $(li).html(element);
  $(`#${ul}`).append(li);
};

const removeRadioOptions = (ele) => {
  $(`#${ele}`).html("");
};

$("body").on("click", ".check", function () {
  $(this).siblings("input[name=dataset_status_radio]:radio").click();
});

$("body").on(
  "change",
  "input[type=radio][name=dataset_status_radio]",
  function () {
    $("#bf_list_dataset_status").val(this.value).trigger("change");
  }
);

// Change dataset status option change
$("#bf_list_dataset_status").on("change", () => {
  $(bfCurrentDatasetStatusProgress).css("visibility", "visible");
  $("#bf-dataset-status-spinner").css("display", "block");

  selectOptionColor(bfListDatasetStatus);

  let selectedBfAccount = defaultBfAccount;
  let selectedBfDataset = defaultBfDataset;
  let selectedStatusOption =
    bfListDatasetStatus.options[bfListDatasetStatus.selectedIndex].text;

  client.invoke(
    "api_bf_change_dataset_status",
    selectedBfAccount,
    selectedBfDataset,
    selectedStatusOption,
    (error, res) => {
      if (error) {
        ipcRenderer.send(
          "track-event",
          "Error",
          "Manage Dataset - Change Dataset Status",
          selectedBfDataset
        );

        log.error(error);
        console.error(error);

        var emessage = userError(error);

        function showErrorDatasetStatus() {
          Swal.fire({
            title: "Failed to change dataset status!",
            text: emessage,
            icon: "error",
            showConfirmButton: true,
            heightAuto: false,
            backdrop: "rgba(0,0,0, 0.4)",
          });

          $(bfCurrentDatasetStatusProgress).css("visibility", "hidden");
          $("#bf-dataset-status-spinner").css("display", "none");
        }

        showCurrentDatasetStatus(showErrorDatasetStatus);
      } else {
        ipcRenderer.send(
          "track-event",
          "Error",
          "Manage Dataset - Change Dataset Status",
          selectedBfDataset
        );

        $(bfCurrentDatasetStatusProgress).css("visibility", "hidden");
        $("#bf-dataset-status-spinner").css("display", "none");

        Swal.fire({
          title: res,
          icon: "success",
          showConfirmButton: true,
          heightAuto: false,
          backdrop: "rgba(0,0,0, 0.4)",
        });
      }
    }
  );
});

function showCurrentDatasetStatus(callback) {
  let selectedBfAccount = defaultBfAccount;
  let selectedBfDataset = defaultBfDataset;

  if (selectedBfDataset === "Select dataset") {
    $(bfCurrentDatasetStatusProgress).css("visibility", "hidden");
    $("#bf-dataset-status-spinner").css("display", "none");

    removeOptions(bfListDatasetStatus);
    removeRadioOptions("dataset_status_ul");

    bfListDatasetStatus.style.color = "black";
  } else {
    client.invoke(
      "api_bf_get_dataset_status",
      selectedBfAccount,
      selectedBfDataset,
      (error, res) => {
        if (error) {
          log.error(error);
          console.error(error);

          let emessage = userError(error);

          Swal.fire({
            title: "Failed to change dataset status!",
            text: emessage,
            icon: "error",
            showConfirmButton: true,
            heightAuto: false,
            backdrop: "rgba(0,0,0, 0.4)",
          });

          $(bfCurrentDatasetStatusProgress).css("visibility", "hidden");
          $("#bf-dataset-status-spinner").css("display", "none");
        } else {
          removeOptions(bfListDatasetStatus);
          removeRadioOptions("dataset_status_ul");

          for (let item in res[0]) {
            let option = document.createElement("option");

            option.textContent = res[0][item]["displayName"];
            option.value = res[0][item]["name"];
            option.style.color = res[0][item]["color"];

            bfListDatasetStatus.appendChild(option);

            addRadioOption(
              "dataset_status_ul",
              res[0][item]["displayName"],
              res[0][item]["name"]
            );
          }
          bfListDatasetStatus.value = res[1];

          $(`input[name=dataset_status_radio][value=${res[1]}]`).prop(
            "checked",
            true
          );

          selectOptionColor(bfListDatasetStatus);

          $(bfCurrentDatasetStatusProgress).css("visibility", "hidden");
          $("#bf-dataset-status-spinner").css("display", "none");

          if (callback !== undefined) {
            callback();
          }
        }
      }
    );
  }
}

//SHARED VARIABLES  (is this vanilla js bad practice? IDK)

const dataset_name = $("#pennsieve-dataset-name");
const dataset_subtitle = $("#guided-dataset-subtitle");
const create_dataset_button = $("#guided-create-empty-dataset");
let current_selected_folder = $("#code-card");

const handleDescriptionConfirmButton = () => {
  //True if user input is invalid
  if (
    check_forbidden_characters_bf(dataset_name.val().trim()) ||
    dataset_name.val().length == 0 ||
    dataset_subtitle.val().length == 0
  ) {
    create_dataset_button.prop("disabled", true);
  } else {
    create_dataset_button.prop("disabled", false);
  }
};

const guidedAllowDrop = (ev) => {
  ev.preventDefault();
};

var guidedFilesElement;
var guidedTargetElement;
const guidedDrop = (ev) => {
  irregularFolderArray = [];
  var action = "";
  guidedFilesElement = ev.dataTransfer.files;
  guidedTargetElement = ev.target;
  // get global path
  console.log(guidedOrganizeDSglobalPath);
  var currentPath = guidedOrganizeDSglobalPath.val();
  console.log(currentPath);
  var jsonPathArray = currentPath.split("/");
  var filtered = jsonPathArray.slice(1).filter(function (el) {
    return el != "";
  });
  var myPath = getRecursivePath(filtered, guidedDatasetStructureJSONObj);
  console.log(guidedDatasetStructureJSONObj);
  console.log(myPath);
  var importedFiles = {};
  var importedFolders = {};
  var nonAllowedDuplicateFiles = [];
  ev.preventDefault();
  var uiFiles = {};
  var uiFolders = {};

  for (var file in myPath["files"]) {
    uiFiles[path.parse(file).base] = 1;
  }
  for (var folder in myPath["folders"]) {
    uiFolders[path.parse(folder).name] = 1;
  }
  for (var i = 0; i < ev.dataTransfer.files.length; i++) {
    var ele = ev.dataTransfer.files[i].path;
    detectIrregularFolders(path.basename(ele), ele);
  }
  var footer = `<a style='text-decoration: none !important' class='swal-popover' data-content='A folder name cannot contain any of the following special characters: <br> ${nonAllowedCharacters}' rel='popover' data-html='true' data-placement='right' data-trigger='hover'>What characters are not allowed?</a>`;
  if (irregularFolderArray.length > 0) {
    Swal.fire({
      title:
        "The following folders contain non-allowed characters in their names. How should we handle them?",
      html:
        "<div style='max-height:300px; overflow-y:auto'>" +
        irregularFolderArray.join("</br>") +
        "</div>",
      heightAuto: false,
      backdrop: "rgba(0,0,0, 0.4)",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Replace characters with (-)",
      denyButtonText: "Remove characters",
      cancelButtonText: "Cancel",
      footer: footer,
      didOpen: () => {
        $(".swal-popover").popover();
      },
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        action = "replace";
      } else if (result.isDenied) {
        action = "remove";
      } else {
        return;
      }
      dropHelper(
        guidedFilesElement,
        guidedTargetElement,
        action,
        myPath,
        importedFiles,
        importedFolders,
        nonAllowedDuplicateFiles,
        uiFiles,
        uiFolders
      );
    });
  } else {
    dropHelper(
      guidedFilesElement,
      guidedTargetElement,
      "",
      myPath,
      importedFiles,
      importedFolders,
      nonAllowedDuplicateFiles,
      uiFiles,
      uiFolders
    );
  }
  console.log("drop allowed");
};

const updateOverallGuidedJSONStructure = (id) => {
  $("#guided-input-global-path").val() = "My_dataset_folder/";
  var optionCards = document.getElementsByClassName(
    "option-card high-level-folders"
  );
  var newDatasetStructureJSONObj = { folders: {}, files: {} };
  var keys = [];
  for (var card of optionCards) {
    if ($(card).hasClass("checked")) {
      keys.push($(card).children()[0].innerText);
    }
  }
  // keys now have all the high-level folders from Step 2
  // datasetStructureJSONObj["folders"] have all the folders both from the old step 2 and -deleted folders in step 3

  // 1st: check if folder in keys, not in datasetStructureJSONObj["folders"], then add an empty object
  // 2nd: check if folder in datasetStructureJSONObj["folders"], add that to newDatasetStructureJSONObj["folders"]
  // 3rd: assign old to new
  // 1st
  keys.forEach((folder) => {
    if ("folders" in datasetStructureJSONObj) {
      if (Object.keys(datasetStructureJSONObj["folders"]).includes(folder)) {
        // clone a new json object
        newDatasetStructureJSONObj["folders"][folder] =
          datasetStructureJSONObj["folders"][folder];
      } else {
        newDatasetStructureJSONObj["folders"][folder] = {
          folders: {},
          files: {},
          type: "",
          action: [],
        };
      }
    }
  });
  // 2nd
  if ("folders" in datasetStructureJSONObj) {
    Object.keys(datasetStructureJSONObj["folders"]).forEach((folderKey) => {
      if (!keys.includes(folderKey)) {
        newDatasetStructureJSONObj["folders"][folderKey] =
          datasetStructureJSONObj["folders"][folderKey];
      }
    });
  }
  // 3rd
  datasetStructureJSONObj = newDatasetStructureJSONObj;
  listItems(datasetStructureJSONObj, "#items");
  getInFolder(
    ".single-item",
    "#items",
    organizeDSglobalPath,
    datasetStructureJSONObj
  );
};

$(document).ready(() => {
  $("#guided-curate-new-dataset-card").click();
  $("#pennsieve-dataset-name").on("keyup", () => {
    let newName = $("#pennsieve-dataset-name").val().trim();

    if (newName !== "") {
      if (check_forbidden_characters_bf(newName)) {
        $("#guided-dataset-name-warning-message").text(
          "A Pennsieve dataset name cannot contain any of the following characters: /:*?'<>."
        );
        $("#guided-dataset-name-warning-message").show();
      } else {
        /*change this to continue button $("#create-pennsieve-dataset").hide(); */

        $("#create-pennsieve-dataset").show();
      }
    } else {
      /*change this to continue button $("#create-pennsieve-dataset").hide(); */
      $("#guided-dataset-name-warning-message").hide();
    }
    handleDescriptionConfirmButton();
  });

  $("#guided-dataset-subtitle").on("keyup", () => {
    countCharacters(guidedDatasetSubtitle, guidedDatasetSubtitleCharCount);
    handleDescriptionConfirmButton();
  });

  //Dropbox event listeners
  $("#guided-items").on("drop", () => {
    guidedDrop(event);
  });
  $("#guided-items").on("dragover", () => {
    guidedAllowDrop(event);
  });

  $("#button-user-no-files").on("click", () => {
    current_selected_folder.css("opacity", "0.2");
    current_selected_folder.next().css("opacity", "1.0");
    current_selected_folder = current_selected_folder.next();
  });

  $("#guided-confirm-folder-organization").on("click", () => {
    $("#guided_folder_organization-tab").hide();
    current_selected_folder.css("opacity", "0.2");
    current_selected_folder.next().css("opacity", "1.0");
    current_selected_folder = current_selected_folder.next();

    $("#guided_folder_selection-tab").show();
  });

  $("#button-user-has-files").on("click", () => {
    $("#guided_folder_selection-tab").hide();
    console.log(guidedDatasetStructureJSONObj);

    console.log(guidedSodaJSONObj);
    const emptyFolderObj = {
      folders: {},
      files: {},
    };
    guidedSodaJSONObj["dataset-structure"]["code"] = emptyFolderObj;
    $("#guided-folder-name").text(current_selected_folder.data("folder-name"));
    $("#guided_folder_organization-tab").show();
  });

  $("#guided-create-empty-dataset").on("click", () => {
    guidedSodaJSONObj["starting-point"] = {};
    guidedSodaJSONObj["starting-point"]["type"] = "new";
    guidedSodaJSONObj["dataset-structure"] = {};
    guidedDatasetStructureJSONObj = { folders: {}, files: {} };
    guidedSodaJSONObj["metadata-files"] = {};
    guidedSodaJSONObj["metadata"] = {};
    guidedSodaJSONObj["metadata"]["name"] = dataset_name.val().trim();
    guidedSodaJSONObj["metadata"]["subtitle"] = dataset_subtitle.val().trim();
    console.log(guidedSodaJSONObj);
    transitionGuidedMode(
      $(this),
      "guided_basic_description-tab",
      "",
      "",
      "individual-question getting-started"
    );
    $("#guided_folder_selection-tab").toggleClass("flex");
  });
});

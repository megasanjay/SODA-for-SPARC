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

  $("#button-user-no-files").on("click", () => {
    current_selected_folder.css("opacity", "0.2");
    current_selected_folder.next().css("opacity", "1.0");
    current_selected_folder = current_selected_folder.next();
  });

  $("#button-user-has-files").on("click", () => {
    $("#guided_folder_selection-tab").hide();
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

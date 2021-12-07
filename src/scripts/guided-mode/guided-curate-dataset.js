const handleDescriptionConfirmButton = () => {
  const dataset_name = $("#pennsieve-dataset-name");
  const dataset_subtitle = $("#guided-dataset-subtitle");
  const create_dataset_button = $("#guided-create-empty-dataset");
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
  $("#guided-create-empty-dataset").click(() => {
    $("#transition-to-folder-organization").click();
  });
});

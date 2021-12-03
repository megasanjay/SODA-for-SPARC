$(document).ready(() => {
  //DATASET CREATION
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
  });
});

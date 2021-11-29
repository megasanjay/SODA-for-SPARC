//FOLDER SELECTOR CLICK HANDLERS
$(document).ready(() => {
  $("#code-card").click(() => {
    alert("I need to be handled");
  });

  $("#primary-card").click(() => {
    alert("I need to be handled");
  });

  $("#source-card").click(() => {
    alert("I need to be handled");
  });

  $("docs-card").click(() => {
    alert("I need to be handled");
  });

  $("#protocol-card").click(() => {
    alert("I need to be handled");
  });

  $("#derivative-card").click(() => {
    alert("I need to be handled");
  });

  //DATASET CREATION
  $("#pennsieve-dataset-name").on("keyup", () => {
    let newName = $("#pennsieve-dataset-name").val().trim();

    if (newName !== "") {
      if (check_forbidden_characters_bf(newName)) {
        Swal.fire({
          title:
            "A Pennsieve dataset name cannot contain any of the following characters: /:*?'<>.",
          icon: "error",
          backdrop: "rgba(0,0,0, 0.4)",
          heightAuto: false,
        });
        $("#create-pennsieve-dataset").hide();
      } else {
        $("#create-pennsieve-dataset").show();
      }
    } else {
      $("#create-pennsieve-dataset").hide();
    }
  });
});

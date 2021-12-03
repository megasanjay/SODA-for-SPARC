$(document).ready(() => {
  alert("hi");
  //DATASET CREATION
  $("#pennsieve-dataset-name").on("keyup", () => {
    let newName = $("#pennsieve-dataset-name").val().trim();
    alert(newName);

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

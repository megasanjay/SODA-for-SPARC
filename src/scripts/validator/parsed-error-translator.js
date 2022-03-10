/*
Purpose: A dictionary/object with translations for a particular (or form of in some more dynamic cases) validator error. The errors are 
         translated into a human readable format that describes what the error is, how to fix it, and when applicable, a link to a place in SODA
         where that error can be fixed.


*/

const ParsedErrorTranslator = {
  translateMissingSubmission: () => {
    return [
      "You are missing a top level submission file",
      "Fix this by creating a top level submission file for your dataset",
      "URL: fix.SODA.page",
    ];
  },

  translateMissingAwardNumber: () => {
    return [
      "Your Submission file is missing an award number",
      "Fix this by visiting your submission file and adding an award number",
      "URL: fix.SODA.page",
    ];
  },

  translateMissingOrganSystem: () => {
    return [
      "Your dataset description file is missing information on the organ system of the study",
      "Fix this by visiting your dataset description file and adding an organ system field/column with appropriate data",
      "URL: fix.SODA.page",
    ];
  },

  translateMissingModality: () => {
    return [
      "Your dataset description file is missing information on the modality of the study",
      "Fix this by visiting your dataset description file and adding a modality field/column with the appropriate information",
      "URL: fix.SODA.page",
    ];
  },

  translateMissingTechnique: () => {
    return [
      "Your dataset description file is missing information on the techniques used in the study",
      "Fix this by visiting your dataset description file and adding a study technique column/field with the appropriate information",
      "URL: fix.SODA.page",
    ];
  },

  translateMissingTechniqueValues: () => {
    return [
      "Your dataset description file's techniques field/column is missing study techniques.",
      "Fix this by visiting your dataset description file and adding at least one study technique in the 'Study technique' field/column.",
      "URL: fix.SODA.page",
    ];
  },

  // TODO: Make it match Local or Pennsieve url/name for the error message translation.
  // TODO: Take out idk lol
  translateIncorrectDatasetName: () => {
    return [
      "Your dataset's name/package does not match expectations of the Pennsieve platform/local datasets",
      "Fix this by changing your dataset's name if this is about your dataset. If not idk lol",
      "URL: fix.SODA.page",
    ];
  },

  translateInvalidDatasetId: () => {
    return [
      "Your Pennsieve dataset does not have a valid UUID",
      "Fix this by contacting the Pennsieve team using the 'Get Help' sidebar menu option.",
      "URL: fpath to Pennsieve",
    ];
  },

  translateInvalidOrganization: () => {
    return [
      "Your organization ID is invalid",
      "Fix this by contacting the Pennsieve team using the 'Get Help' sidebar menu option.",
      "URL: fpath to Pennsieve",
    ];
  },

  translateMissingFunding: () => {
    return [
      "Your dataset description file is missing a Funding field/column",
      "Fix this by adding a Funding field/column to your dataset description column.",
      "URL: path to SODA",
    ];
  },

  translateMissingProtocolUrlOrDoi: () => {
    return [
      "Your samples file is missing a 'protocol url or doi' column/field",
      "Fix this by adding a 'protocol url or doi' field/column to your samples file.",
      "URL: path to SODA",
    ];
  },

  translateMissingTitle: () => {
    return [
      "Your dataset description file is missing a 'title' column/field",
      "Fix this by adding a 'title' field/column to your dataset description file.",
      "URL: path to SODA",
    ];
  },

  translateMissingNumberOfSubjects: () => {
    return [
      "Your dataset description file is missing a 'number_of_subjects' column/field",
      "Fix this by adding a 'number_of_subjects' field/column to your dataset description file.",
      "URL: path to SODA",
    ];
  },

  translateMissingNumberOfSamples: () => {
    return [
      "Your dataset description file is missing a 'number_of_samples' column/field",
      "Fix this by adding a 'number_of_samples' field/column to your dataset description file.",
      "URL: path to SODA",
    ];
  },

  translateInvalidContributorRole: (errorMessage) => {
    // get the contributor role values that are marked as incorrect from the error message
    let searchForContributorValues = /\['*.'\]/g;

    let invalidContributorValues =
      searchForContributorValues.match(errorMessage);

    let errorExplanation = "";
    // handle the case where no contributors are found
    if (!invalidContributorValues.length) {
      errorExplanation =
        "Your dataset description file has invalid contributor role values.";
    } else {
      errorExplanation = `Your dataset description file has these invalid contributor role values: ${invalidContributorValues.join(
        ","
      )}`;
    }

    return [
      errorExplanation,
      "To fix, select one of the valid contributor role values provided by data cite. SODA makes this easy.",
      "URL: Path to SODA",
    ];
  },

  // used in SDS 1.2.3 for dataset description file
  translateMissingName: (errorMessage) => {
    return [
      "Your dataset description file is missing a 'name' column/field",
      "Fix this by adding a 'name' field/column to your dataset description file.",
      "URL: path to SODA",
    ];
  },

  // used in SDS 1.2.3 for dataset description file
  translateMissingDescription: () => {
    return [
      "Your dataset 'description' file is missing a description field/column.",
      "Fix this by adding a 'description' field/column to your dataset description file.",
      "URL: path to SODA",
    ];
  },

  translateMissingSamples: () => {
    return [
      "Your dataset does not have a samples file",
      "To fix this add a samples file and fill in at least one row of required fields.",
      "URL: path to SODA",
    ];
  },

  translateMissingSubjects: () => {
    return [
      "Your dataset does not have a subjects file",
      "To fix this add a subjects file and fill in at least one row of required fields.",
      "URL: path to SODA",
    ];
  },

  translateInvalidSubjectIdPattern: (errorMessage) => {
    // get the user's invalid subject id out of the error message
    // TODO: Make a function that pulls the invalid parameter(s?) out of an error message. I want to show the user what is actually invalid, but since they're returned in the string rahter than a list or some other
    //       easily accessible container I'll need to access the parameter by the string's features. These may change. If I do this in a lot of the pattern errors this may result in a lot of changes to deal with.
    let searchForTextFollowingId = /does not match/;

    let indexOfTextFollowingId = searchForTextFollowingId.exec(errorMessage);

    let errorExplanation = "";

    // handle there being no parameters found
    // happens if the regex is bad and doesn't find a result
    if (!indexOfTextFollowingId) {
      errorExplanation =
        "One of your Subject file's subject Ids has an invalid format";
    } else {
      let invalidId = errorMessage.slice(0, indexOfTextFollowingId).trim();
      errorExplanation = `Your subject file has this invalid subject id: ${invalidId}`;
    }

    return [
      errorExplanation,
      'To correct this problem change the invalid subject ID to be formatted as a string without these invalid characters: <>/"\\',
      "URL: path to SODA",
    ];
  },
};

exports.ParsedErrorTranslator = ParsedErrorTranslator;
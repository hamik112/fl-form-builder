//
//    ACTION CREATORS
//

export const undo = _ =>
({
  type: "undo",
});

export const importState = newFieldsState =>
({
  type: "importState",
  newFieldsState,
});

export const createField = fieldType =>
({
  type: "createField",
  async: true,
  fieldType,
});

export const fieldCreated = createdFieldState =>
({
  type: "createField",
  createdFieldState,
});

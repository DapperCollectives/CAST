import * as yup from 'yup';

yup.addMethod(yup.array, 'unique', function (field, message) {
  return this.test('unique', message, function (array = []) {
    const uniqueData = Array.from(
      new Set(array.map((row) => row[field]?.toLowerCase()))
    );
    const isUnique = array.length === uniqueData.length;
    if (isUnique) {
      return true;
    }
    const index = array.findIndex(
      (row, i) => row[field]?.toLowerCase() !== uniqueData[i]
    );
    if (array[index][field] === '') {
      return true;
    }
    return this.createError({
      path: `${this.path}.${index}.${field}`,
      message,
    });
  });
});

export default yup;

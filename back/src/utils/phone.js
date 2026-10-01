const REGEX_PHONE = /^[0-9 +.()-]{6,20}$/;

function validatePhone(value) {
  return typeof value === "string" && REGEX_PHONE.test(value);
}

module.exports = { validatePhone };

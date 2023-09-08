"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addValues = exports.setDecimalPlaces = exports.currentDateAsUTCString = void 0;
function currentDateAsUTCString() {
    return new Date(Date.now()).toISOString();
}
exports.currentDateAsUTCString = currentDateAsUTCString;
/**
 * <p>Credits to https://stackoverflow.com/a/64383436</p>
 * Used to round both strings and numbers with the given decimals
 * <p>Examples for 2 decimals:</p>
 *      <p>14 = "14.00"</p>
 *      <p>"14" = "14.00"</p>
 *      <p>"14.555"= "14.56"</p>
 * @param value value to be rounded
 * @param decimal number of decimal places (default = 2)
 *
 * @returns rounded value to given decimals as string
 */
function setDecimalPlaces(value, decimal = 2) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    const precision = 10 ** decimal;
    const n = value * precision * (1 + Number.EPSILON);
    const roundedNumber = Math.round(n) / precision;
    return roundedNumber.toFixed(decimal);
}
exports.setDecimalPlaces = setDecimalPlaces;
/**
 * Arithmetic sum of both values with 2 decimal precision
 * @param first
 * @param second
 *
 * @returns sum as string
 */
function addValues(first, second) {
    first = setDecimalPlaces(first);
    second = setDecimalPlaces(second);
    return setDecimalPlaces(parseFloat(first) + parseFloat(second));
}
exports.addValues = addValues;

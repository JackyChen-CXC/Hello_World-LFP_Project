"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionSchema = void 0;
var mongoose_1 = require("mongoose");
exports.DistributionSchema = new mongoose_1.Schema({
    type: { type: String, enum: ["fixed", "normal", "uniform", "startWith", "endWhen"], required: true },
    // fixed
    value: { type: Number,
        required: function () {
            return this.type === "fixed";
        } },
    // normal
    mean: { type: Number,
        required: function () {
            return this.type === "normal";
        } },
    stdev: { type: Number, min: 0,
        required: function () {
            return this.type === "normal";
        } },
    // uniform
    lower: { type: Number,
        required: function () {
            return this.type === "uniform";
        } },
    upper: { type: Number,
        required: function () {
            return this.type === "uniform";
        } },
    // startWith + endWhen
    eventSeries: { type: String,
        required: function () {
            return this.type === "startWith" || this.type === "endWhen";
        } }
}, { _id: false });

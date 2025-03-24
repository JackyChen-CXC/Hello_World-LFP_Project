import { Schema } from "mongoose";

/** For use as sub-schema in other schemas (From on scenario YAML)
# {type: fixed, value: <number>}
# {type: normal, mean: <number>, stdev: <number>}
# {type: uniform, lower: <number>, upper: <number>}
# {type: startWith, eventSeries: <string>}
# {type: endWhen, eventSeries: <string>}
# percentages are represented by their decimal value, e.g., 4% is represented as 0.04.
*/

export interface IDistribution {
    type: "fixed" | "normal" | "uniform" | "startWith" | "endWhen";
    value?: number;
    mean?: number;
    stdev?: number;
    lower?: number;
    upper?: number;
    eventSeries?: string;
}

export const DistributionSchema = new Schema<IDistribution>({
    type: { type: String, enum: ["fixed", "normal", "uniform", "GBM", "startWith"], required: true },
    // fixed
    value: { type: Number,
        required: function (this: IDistribution) { return this.type === "fixed";
    }},
    // normal
    mean: { type: Number,
        required: function (this: IDistribution) { return this.type === "normal";
    }},
    stdev: { type: Number, min: 0,
        required: function (this: IDistribution) { return this.type === "normal";
    }},
    // uniform
    lower: { type: Number,
        required: function (this: IDistribution) { return this.type === "uniform";
    }},
    upper: { type: Number,
        required: function (this: IDistribution) { return this.type === "uniform";
    }},
    // startWith + endWhen
    eventSeries: { type: String,
        required: function (this: IDistribution) { return this.type === "startWith" || this.type === "endWhen";
    }}},
    { _id: false }
);
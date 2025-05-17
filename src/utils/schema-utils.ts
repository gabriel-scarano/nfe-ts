import { z } from "zod";
import { removeAccents } from "./string-utils";

export const refinedStringSchema = (min: number, max: number) => {
    return z.string().trim().min(min).max(max).transform(t => removeAccents(t));
};

export const numberWithPrecisionSchema = (precision: number) => {
    return z.number().refine(
        (val) => Number.isInteger(val * 10 * precision),
        {
            message: `O número deve ter no máximo ${precision} casas decimais`,
        }
    )
}

export const ufSchema = z.enum([
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO'
]);
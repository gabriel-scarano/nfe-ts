import { object, z } from "zod";
import { numberWithPrecisionSchema, ufSchema } from "../utils/schema-utils";

export const origSchema = z.enum(["0", "2", "3", "4", "5", "6", "7", "8"]);
export const modBCSchema = z.enum(["0", "1", "2", "3"]);
export const modBCSTSchema = z.enum(["0", "1", "2", "3", "4", "5", "6"]);
export const modBCSTSNSchema = z.enum(["0", "1", "2", "3", "4", "5"]);

export const fcpSchema = z.object({
    pFCP: numberWithPrecisionSchema(4),
    vFCP: numberWithPrecisionSchema(2),
});

export const fcpBcSchema = fcpSchema.extend({
    vBCFCP: numberWithPrecisionSchema(2),
});

export const fcpSTSchema = z.object({
    vBCFCPST: numberWithPrecisionSchema(2),
    pFCPST: numberWithPrecisionSchema(4),
    vFCPST: numberWithPrecisionSchema(2),
})

export const icmsDesSchema = (icms: "20" | "30" | "40" | "70" | "90") => z.object({
    vICMSDeson: numberWithPrecisionSchema(2),
    motDesICMS: z.enum((() => {
        if (icms == "20" || icms == "70") {
            return ["3", "9", "12"]
        }

        else if (icms == "30") {
            return ["6", "7", "9"]
        }

        else if (icms == "40") {
            return ["1", "3", "4", "5", "6", "7", "8", "9", "10", "11", "16"]
        }

        else if (icms == "90") {
            return ["9", "12"]
        }

        return [""]
    })()),
})

export const icmsRetSchema = z.object({
    vBCSTRet: numberWithPrecisionSchema(2),
    pST: numberWithPrecisionSchema(4),
    vICMSSubstituto: numberWithPrecisionSchema(2).optional(),
    vICMSSTRet: numberWithPrecisionSchema(2),
})

export const fcpRetSchema = z.object({
    vBCFCPSTRet: numberWithPrecisionSchema(2),
    pFCPSTRet: numberWithPrecisionSchema(4),
    vFCPSTRet: numberWithPrecisionSchema(2),
})

export const icmsEfetSchema = z.object({
    pRedBCEfet: numberWithPrecisionSchema(4).optional(),
    vBCEfet: numberWithPrecisionSchema(2).optional(),
    pICMSEfet: numberWithPrecisionSchema(4).optional(),
    vICMSEfet: numberWithPrecisionSchema(2).optional(),
})

export const icms00Schema = z.object({
    orig: origSchema,
    modBC: modBCSchema,
    vBC: numberWithPrecisionSchema(2),
    pICMS: numberWithPrecisionSchema(4),
    vICMS: numberWithPrecisionSchema(2),
    fcp: fcpSchema.optional(),
});

export const icms10Schema = z.object({
    orig: origSchema,
    modBC: modBCSchema,
    vBC: numberWithPrecisionSchema(2),
    pICMS: numberWithPrecisionSchema(4),
    vICMS: numberWithPrecisionSchema(2),
    fcp: fcpBcSchema.optional(),
    modBCST: modBCSTSchema,
    pMVAST: numberWithPrecisionSchema(4).optional(),
    pRedBCST: numberWithPrecisionSchema(4).optional(),
    vBCST: numberWithPrecisionSchema(2),
    pICMSST: numberWithPrecisionSchema(4),
    vICMSST: numberWithPrecisionSchema(2),
    fcpST: fcpSTSchema.optional(),
});

export const icms20Schema = z.object({
    orig: origSchema,
    modBC: modBCSchema,
    pRedBC: numberWithPrecisionSchema(4),
    vBC: numberWithPrecisionSchema(2),
    pICMS: numberWithPrecisionSchema(4),
    vICMS: numberWithPrecisionSchema(2),
    fcp: fcpBcSchema.optional(),
    icmsDes: icmsDesSchema("20").optional(),
});

export const icms30Schema = z.object({
    orig: origSchema,
    modBCST: modBCSTSchema,
    pMVAST: numberWithPrecisionSchema(4).optional(),
    pRedBCST: numberWithPrecisionSchema(4).optional(),
    vBCST: numberWithPrecisionSchema(2),
    pICMSST: numberWithPrecisionSchema(4),
    vICMSST: numberWithPrecisionSchema(2),
    fcpST: fcpSTSchema.optional(),
    icmsDes: icmsDesSchema("30").optional(),
})

// icms 40, 41 e 50
export const icms40Schema = z.object({
    orig: origSchema,
    CST: z.enum(["40", "41", "50"]),
    icmsDes: icmsDesSchema("40").optional(),
})

export const icms51Schema = z.object({
    orig: origSchema,
    modBC: modBCSchema.optional(),
    pRedBC: numberWithPrecisionSchema(4).optional(),
    vBC: numberWithPrecisionSchema(2).optional(),
    pICMS: numberWithPrecisionSchema(4).optional(),
    vICMSOp: numberWithPrecisionSchema(2).optional(),
    pDif: numberWithPrecisionSchema(4).optional(),
    vICMSDif: numberWithPrecisionSchema(2).optional(),
    vICMS: numberWithPrecisionSchema(2).optional(),
    fcp: fcpBcSchema.optional(),
});

export const icms60Schema = z.object({
    orig: origSchema,
    icmsRet: icmsRetSchema.optional(),
    fcpRet: fcpRetSchema.optional(),
    icmsEfet: icmsEfetSchema.optional(),
})

export const icms70Schema = z.object({
    orig: origSchema,
    modBC: modBCSchema,
    vBC: numberWithPrecisionSchema(2),
    pICMS: numberWithPrecisionSchema(4),
    vICMS: numberWithPrecisionSchema(2),
    fcp: fcpBcSchema.optional(),
    modBCST: modBCSTSchema,
    pMVAST: numberWithPrecisionSchema(4).optional(),
    pRedBCST: numberWithPrecisionSchema(4).optional(),
    vBCST: numberWithPrecisionSchema(2),
    pICMSST: numberWithPrecisionSchema(4),
    vICMSST: numberWithPrecisionSchema(2),
    fcpST: fcpSTSchema.optional(),
    icmsDes: icmsDesSchema("70").optional()
})

export const icms90Schema = z.object({
    orig: origSchema,
    icms: z.object({
        modBC: modBCSchema,
        pRedBC: numberWithPrecisionSchema(4),
        vBC: numberWithPrecisionSchema(2),
        pICMS: numberWithPrecisionSchema(4),
        vICMS: numberWithPrecisionSchema(2),
    }).optional(),
    fcp: fcpBcSchema.optional(),
    icmsST: z.object({
        modBCST: modBCSTSchema,
        pMVAST: numberWithPrecisionSchema(4).optional(),
        pRedBCST: numberWithPrecisionSchema(4).optional(),
        vBCST: numberWithPrecisionSchema(2),
        pICMSST: numberWithPrecisionSchema(4),
        vICMSST: numberWithPrecisionSchema(2),
    }).optional(),
    fcpST: fcpSTSchema.optional(),
    icmsDes: icmsDesSchema("90").optional(),
});

export const icmsPartSchema = z.object({
    orig: origSchema,
    CST: z.enum(["10", "90"]),
    modBC: modBCSchema,
    vBC: numberWithPrecisionSchema(2),
    pRedBC: numberWithPrecisionSchema(4).optional(),
    pICMS: numberWithPrecisionSchema(4),
    vICMS: numberWithPrecisionSchema(2),
    modBCST: modBCSTSchema,
    pMVAST: numberWithPrecisionSchema(4).optional(),
    pRedBCST: numberWithPrecisionSchema(4).optional(),
    vBCST: numberWithPrecisionSchema(2),
    pICMSST: numberWithPrecisionSchema(4),
    vICMSST: numberWithPrecisionSchema(2),
    pBCOp: numberWithPrecisionSchema(4),
    UFST: z.union([
        ufSchema,
        z.enum(['EX']),
    ]),
})

export const icmsSTSchema = z.object({
    orig: origSchema,
    cst: z.enum(["41", "60"]),
    vBCSTRet: numberWithPrecisionSchema(2),
    pST: numberWithPrecisionSchema(4).optional(),
    vICMSSubstituto: numberWithPrecisionSchema(2).optional(),
    vICMSSTRet: numberWithPrecisionSchema(2),
    fcp: fcpRetSchema.optional(),
    vBCSTDest: numberWithPrecisionSchema(2),
    vICMSSTDest: numberWithPrecisionSchema(2),
    icmsEfet: icmsEfetSchema.optional(),
});

export const icmsSN101Schema = z.object({
    orig: origSchema,
    pCredSN: numberWithPrecisionSchema(4),
    vCredICMSSN: numberWithPrecisionSchema(2),
});

export const icmsSN102Schema = z.object({
    orig: origSchema,
    CSOSN: z.enum(["102", "103", "300", "400"]),
});

export const icmsSN201Schema = z.object({
    orig: origSchema,
    modBCST: modBCSTSNSchema,
    pMVAST: numberWithPrecisionSchema(4).optional(),
    pRedBCST: numberWithPrecisionSchema(4).optional(),
    vBCST: numberWithPrecisionSchema(2),
    pICMSST: numberWithPrecisionSchema(4),
    vICMSST: numberWithPrecisionSchema(2),
    fcp: fcpSTSchema.optional(),
    pCredSN: numberWithPrecisionSchema(4),
    vCredICMSSN: numberWithPrecisionSchema(2),
});

export const icmsSN202Schema = z.object({
    orig: origSchema,
    CSOSN: z.enum(["202", "203"]),
    modBCST: modBCSTSNSchema,
    pMVAST: numberWithPrecisionSchema(4).optional(),
    pRedBCST: numberWithPrecisionSchema(4).optional(),
    vBCST: numberWithPrecisionSchema(2),
    pICMSST: numberWithPrecisionSchema(4),
    vICMSST: numberWithPrecisionSchema(2),
    fcp: fcpSTSchema.optional(),
})

export const icmsSN500Schema = z.object({
    orig: origSchema,
    icmsRet: icmsRetSchema.optional(),
    fcp: fcpRetSchema.optional(),
    icmsEfet: icmsEfetSchema.optional(),
})

export const icmsSN900Schema = z.object({
    orig: origSchema,
    icms: z.object({
        modBC: modBCSchema,
        pRedBC: numberWithPrecisionSchema(4),
        vBC: numberWithPrecisionSchema(2),
        pICMS: numberWithPrecisionSchema(4),
        vICMS: numberWithPrecisionSchema(2),
    }).optional(),
    icmsST: z.object({
        modBCST: modBCSTSchema,
        pMVAST: numberWithPrecisionSchema(4).optional(),
        pRedBCST: numberWithPrecisionSchema(4).optional(),
        vBCST: numberWithPrecisionSchema(2),
        pICMSST: numberWithPrecisionSchema(4),
        vICMSST: numberWithPrecisionSchema(2),
    }).optional(),
    fcpST: fcpSTSchema.optional(),
    icmsSN: z.object({
        pCredSN: numberWithPrecisionSchema(4),
        vCredICMSSN: numberWithPrecisionSchema(4),
    }).optional(),
})

export const icmsUFDestSchema = z.object({
    vBCUFDest: numberWithPrecisionSchema(2),
    vBCFCPUFDest: numberWithPrecisionSchema(2),
    pFCPUFDest: numberWithPrecisionSchema(2).optional(),
    pICMSUFDest: numberWithPrecisionSchema(2),
    pICMSInter: numberWithPrecisionSchema(2),
    pICMSInterPart: numberWithPrecisionSchema(2),
    vFCPUFDest: numberWithPrecisionSchema(2).optional(),
    vICMSUFDest: numberWithPrecisionSchema(2),
    vICMSUFRemet: numberWithPrecisionSchema(2),
})
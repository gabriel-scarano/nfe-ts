import z from 'zod';
import { removeAccents, validateCnpj, validateCpf } from '../utils/string-utils';

export const cnpjSchema = z.string().length(14).refine(val => validateCnpj(val));
export const cpfSchema = z.string().length(11).refine(val => validateCpf(val));
export const idEstrangeiroSchema = z.string().length(5).or(z.string().length(20)).optional(); 
export const refinedStringSchema = (min: number, max: number) => {
    return z.string().trim().min(min).max(max).transform(t => removeAccents(t));
};
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
export const enderecoSchema = z.object({
    xLgr: refinedStringSchema(2, 60),
    nro: refinedStringSchema(1, 60),
    xCpl: refinedStringSchema(1, 60).optional(),
    xBairro: refinedStringSchema(2, 60),
    cMun: z.string().regex(/^\d{7}$/),
    UF: ufSchema,
    CEP: z.string().regex(/^\d{8}$/).optional(),
    cPais: z.number().int(),
    fone: refinedStringSchema(6, 14),
})

// SCHEMAS - NFE
export const nfRefSchema = z.union([
    z.object({
        refNFe: z.string().length(44),
        refNF: z.union([
            z.object({
                cUF: z.number(), // TODO validação
                AAMM: z.string(), // TODO validação
                CNPJ: cnpjSchema,
                mod: z.enum(["01", "02"]),
                serie: z.number().int().gte(0).lte(969).default(0),
                nNF: z.number().int().gte(1).lt(1000000000),
            }),
            z.object({
                cUF: z.number(), // TODO validação
                AAMM: z.string(), // TODO validação
                cpfCnpj: z.union([
                    cnpjSchema,
                    cpfSchema,
                ]),
                ie: z.string().default("ISENTO"), // TODO validação da IE
                mod: z.enum(["01", "04"]),
                serie: z.number().int().gte(0).lte(969).default(0),
                nNF: z.number().int().gte(1).lt(1000000000),
            }),
        ])
    }),
    z.object({
        refCTe: z.string().length(44),
        refNF: z.object({
            mod: z.enum(["2B", "2C", "2D"]),
            nECF: z.number().int().gte(100).lte(999),
            nCOO: z.number().int().gte(100000).lte(999999)
        })
    })
])

export const ideSchema = z.object({
    natOp: refinedStringSchema(1, 60),
    serie: z.number().int().gte(0).lte(969).default(0),
    nNF: z.number().int().gte(1).lt(1000000000),
    dhEmi: z.date().default(new Date(Date.now())),
    dhSaiEnt: z.date().default(new Date(Date.now())),
    tpNF: z.enum(["0", "1"]),
    idDest: z.enum(["1", "2", "3"]),
    tpImp: z.enum(["0", "1", "2", "3"]),
    finNFe: z.enum(["1", "2", "3", "4"]),
    indFinal: z.enum(["0", "1"]),
    indPres: z.enum(["0", "1", "2", "3", "4", "5", "9"]),
    indIntermed: z.enum(["0", "1"]).optional(),
    NFref: z.array(nfRefSchema).min(0).max(500).optional()
});

export const emitSchema = z.object({
    CNPJ: cnpjSchema,
    xNome: refinedStringSchema(2, 60),
    xFant: refinedStringSchema(1, 60).optional(),
    enderEmit: enderecoSchema,
    IE:  z.string(), // TODO validação da IE
    IEST: z.string().optional(), // TODO validação da IE
    nfeConjugada: z.object({
        IM: refinedStringSchema(1, 15),
        CNAE: z.string().regex(/^\d{7}$/).optional(),
    }),
    CRT: z.enum(["1", "2", "3"]),
})

export const destSchema = z.object({
    cpfCnpjEst: z.union([
        cnpjSchema,
        cpfSchema,
        idEstrangeiroSchema,
    ]),
    xNome: refinedStringSchema(2, 60),
    enderDest: enderecoSchema,
    indIEDest: z.enum(["1", "2", "9"]),
    IE: z.string().optional(),
    ISUF: refinedStringSchema(8, 9).optional(),
    IM: refinedStringSchema(1, 15).optional(),
    email: z.string().email().optional(),
}).refine(
    (data) => {
        if (idEstrangeiroSchema.safeParse(data.cpfCnpjEst).success) {
            return data.indIEDest === "9";
        }
        return true;
    },
    {
        message: "Para ID estrangeiro, indIEDest deve ser '9'",
        path: ["indIEDest"]
    }
).refine(
    (data) => {
        // Regra 2: Se for ID estrangeiro, IE não deve estar preenchido
        if (idEstrangeiroSchema.safeParse(data.cpfCnpjEst).success) {
            return data.IE === undefined;
        }
        return true;
    },
    {
        message: "Para ID estrangeiro, IE não deve ser informada",
        path: ["IE"]
    }
).refine(
    (data) => {
        if (data.indIEDest === "2") {
            return data.IE === undefined;
        }
        return true;
    },
    {
        message: "Para indIEDest='2', IE não deve ser informada",
        path: ["IE"]
    }
).refine(
    (data) => {
        if (data.indIEDest === "1") {
            return data.IE !== undefined && data.IE !== "";
        }
        return true;
    },
    {
        message: "Para indIEDest='1', IE é obrigatória",
        path: ["IE"]
    }
);

export const retiradaSchema = z.object({
    cpfCnpj: z.union([
        cnpjSchema.optional(),
        cpfSchema,
    ]),
    xNome: refinedStringSchema(2, 60).optional(),
    endereco: enderecoSchema,
    emailExpedidor: z.string().email().optional(),
    ieExpedidor: z.string().optional(),
})

export const nfeSchema = z.object({
    ide: ideSchema,
    emit: emitSchema,
    dest: destSchema,
    retirada: retiradaSchema,
})
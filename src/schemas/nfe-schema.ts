import z, { number } from 'zod';
import { removeAccents, validateCnpj, validateCpf } from '../utils/string-utils';
import { CodigoUFEnum, type CodigoUF } from '../xml/xml-types';
import { numberWithPrecisionSchema, refinedStringSchema, ufSchema } from '../utils/schema-utils';
import { icms00Schema, icms10Schema, icms20Schema, icms30Schema, icms40Schema, icms51Schema, icms60Schema, icms70Schema, icms90Schema, icmsPartSchema, icmsSN101Schema, icmsSN102Schema, icmsSN201Schema, icmsSN202Schema, icmsSN500Schema, icmsSN900Schema, icmsSTSchema, icmsUFDestSchema } from './icms-schema';

export const cnpjSchema = z.string().length(14).refine(val => validateCnpj(val));
export const cpfSchema = z.string().length(11).refine(val => validateCpf(val));
export const idEstrangeiroSchema = z.string().length(5).or(z.string().length(20)).optional();
export const dateSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
export const cEanSchema = z.union([
    z.string().trim().length(8),
    z.string().trim().length(12),
    z.string().trim().length(13),
    z.string().trim().length(14),
]);

export const enderecoSchema = z.object({
    xLgr: refinedStringSchema(2, 60),
    nro: refinedStringSchema(1, 60),
    xCpl: refinedStringSchema(1, 60).optional(),
    xBairro: refinedStringSchema(2, 60),
    cMun: z.string().regex(/^\d{7}$/),
    UF: ufSchema,
    CEP: z.string().regex(/^\d{8}$/).optional(),
    cPais: z.number().int().optional(),
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
    IE: z.string(), // TODO validação da IE
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
    ieExpedidor: z.string().optional(), // TODO validação da IE
})

export const entregaSchema = z.object({
    cpfCnpj: z.union([
        cnpjSchema.optional(),
        cpfSchema,
    ]),
    xNome: refinedStringSchema(2, 60).optional(),
    endereco: enderecoSchema,
    fone: refinedStringSchema(6, 14).optional(),
    emailRecebedor: z.string().email().optional(),
    ieExpedidor: z.string().optional(), // TODO validação da IE
})

export const autXMLSchema = z.array(z.union([
    cpfSchema,
    cnpjSchema,
])).max(10);

export const adiSchema = z.array(z.object({
    nAdicao: z.number().int().gte(1).lte(999),
    cFabricante: refinedStringSchema(1, 60),
    vDescDI: numberWithPrecisionSchema(2).optional(),
    nDraw: z.union([
        z.string().length(9),
        z.string().length(11),
    ]).optional()

})).min(1).max(100)

export const diSchema = z.object({
    nDI: refinedStringSchema(1, 12),
    dDI: dateSchema,
    xLocDesemb: refinedStringSchema(1, 60),
    UFDesemb: ufSchema,
    dDesemb: dateSchema,
    tpViaTransp: z.enum(["1", "2", "3", "4", "5", "6", "7"]),
    vAFRMM: numberWithPrecisionSchema(2).optional(),
    tpIntermedio: z.enum(["1", "2", "3"]),
    CNPJ: cnpjSchema.optional(),
    UFTerceiro: ufSchema.optional(),
    cExportador: refinedStringSchema(1, 60),
    adi: adiSchema,
}).refine(
    (data) => {
        if (data.tpViaTransp == '1' && data.vAFRMM === undefined) {
            return false;
        }
        return true;
    },
    {
        message: "Para tpViaTransp='1', vAFRMM é obrigatório",
        path: ["vAFRMM"]
    }
).refine(
    (data) => {
        if ((data.tpIntermedio == '2' || data.tpIntermedio == '3') && data.CNPJ === undefined) {
            return false;
        }
        return true;
    },
    {
        message: "Para tpIntermedio='2' ou tpIntermedio='3', CNPJ é obrigatório",
        path: ["CNPJ"]
    }
).refine(
    (data) => {
        if ((data.tpIntermedio == '2' || data.tpIntermedio == '3') && data.UFTerceiro === undefined) {
            return false;
        }
        return true;
    },
    {
        message: "Para tpIntermedio='2' ou tpIntermedio='3', UFTerceiro é obrigatório",
        path: ["UFTerceiro"]
    }
);

export const detExportSchema = z.object({
    nDraw: z.union([
        z.string().length(9),
        z.string().length(11),
    ]).optional(),
    exportInd: z.object({
        nRE: z.string().regex(/^\d{12}$/),
        chNFe: z.string().regex(/^\d{44}$/),
        qExport: numberWithPrecisionSchema(4),
    }).optional(),
});

export const rastroSchema = z.object({
    nLote: refinedStringSchema(1, 20),
    qLote: numberWithPrecisionSchema(3),
    dFab: dateSchema,
    dVal: dateSchema,
    cAgreg: z.string().regex(/^\d{1,20}$/),
})

export const veicProdSchema = z.object({
    tpOp: z.enum(["1", "2", "0"]),
    chassi: z.string().trim().length(17),
    cCor: refinedStringSchema(1, 4),
    xCor: refinedStringSchema(1, 40),
    pot: refinedStringSchema(1, 4),
    cilin: refinedStringSchema(1, 4),
    pesoL: numberWithPrecisionSchema(4),
    pesoB: numberWithPrecisionSchema(4),
    nSerie: refinedStringSchema(1, 9),
    tpComb: z.enum(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"]),
    nMotor: refinedStringSchema(1, 21),
    CMT: numberWithPrecisionSchema(4),
    dist: refinedStringSchema(1, 4),
    anoMod: z.number().int().gte(1000).lt(10000),
    tpPint: z.string().trim().length(1),
    tpVeic: z.enum(["02", "03", "04", "05", "06", "07", "08", "10", "11", "13", "14", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26"]),
    espVeic: z.enum(["1", "2", "3", "4", "5", "6"]),
    VIN: z.enum(["R", "N"]),
    condVeic: z.enum(["1", "2", "3"]),
    cMod: z.string().regex(/^\d{1,6}$/),
    cCorDENATRAN: z.enum(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16"]),
    lota: z.number().int().gte(0).lt(999),
    tpRest: z.enum(["0", "1", "2", "3", "4", "9"]),
});

export const medSchema = z.object({
    cProdANVISA: z.string().length(13).optional(),
    xMotivoIsencao: refinedStringSchema(1, 255).optional(),
    vPMC: numberWithPrecisionSchema(2),
}).refine(
    (data) => {
        if (data.cProdANVISA === undefined && data.xMotivoIsencao === undefined) {
            return false;
        }

        return true;
    },
    {
        message: "Para cProdANVISA ISENTO, xMotivoIsencao é obrigatório",
        path: ["xMotivoIsencao"]
    }
);

export const armaSchema = z.array(z.object({
    tpArma: z.enum(["0", "1"]),
    nSerie: refinedStringSchema(1, 15),
    nCano: refinedStringSchema(1, 15),
    desc: refinedStringSchema(1, 256),
})).min(1).max(500)

export const combSchema = z.object({
    cProdANP: z.string().regex(/^\d{9}$/),
    descANP: z.string().regex(/^\d{2,95}$/),
    pGLP: numberWithPrecisionSchema(4).optional(),
    pGNn: numberWithPrecisionSchema(4).optional(),
    pGNi: numberWithPrecisionSchema(4).optional(),
    vPart: numberWithPrecisionSchema(2).optional(),
    CODIF: z.string().regex(/^\d{1,21}$/).optional(),
    qTemp: numberWithPrecisionSchema(4).optional(),
    UFCons: z.union([
        ufSchema,
        z.enum(['EX']),
    ]),
    CIDE: z.object({
        qBCProd: numberWithPrecisionSchema(4),
        vAliqProd: numberWithPrecisionSchema(4),
        vCIDE: numberWithPrecisionSchema(2),
    }).optional(),
    encerrante: z.object({
        nBico: z.string().regex(/^\d{1,3}$/),
        nBomba: z.string().regex(/^\d{1,3}$/).optional(),
        nTanque: z.string().regex(/^\d{1,3}$/),
        vEncIni: numberWithPrecisionSchema(3),
        vEncFin: numberWithPrecisionSchema(3),
    }).optional(),
});

export const nRECOPISchema = z.string().regex(/^\d{20}$/);

export const ipiSchema = z.object({
    CNPJProd: cnpjSchema.optional(),
    cSelo: refinedStringSchema(1, 60).optional(),
    qSelo: z.number().int().positive().optional(),
    cEnq: z.string().regex(/^\d{1,3}$/),
    CST: z.enum(["00", "49", "50", "99", "01", "02", "03", "04", "05", "51", "52", "53", "54", "55"]),
    IPITrib: z.object({
        calculo: z.union([
            z.object({
                vBC: numberWithPrecisionSchema(2),
                pIPI: numberWithPrecisionSchema(4),
            }),
            z.object({
                qUnid: numberWithPrecisionSchema(4),
                vUnid: numberWithPrecisionSchema(4),
                vIPI: numberWithPrecisionSchema(2),
            })
        ])
    }).optional(),
}).refine(
    (data) => {
        if (["00", "49", "50", "99"].includes(data.CST) && data.IPITrib === undefined) {
            return false;
        }
        return true;
    },
    {
        message: "Para grupo do CST = ('00', '49', '50', '99'), IPITrib é obrigatório",
        path: ["IPITrib"]
    }
);

export const iiSchema = z.object({
    vBC: numberWithPrecisionSchema(2),
    vDespAdu: numberWithPrecisionSchema(2),
    vII: numberWithPrecisionSchema(2),
    vIOF: numberWithPrecisionSchema(2),
})

export const pisSchema = z.object({
    CST: z.enum(["01", "02", "03", "04", "05", "06", "07", "08", "09", "49", "50", "51", "52", "53", "54", "55", "56", "60", "61", "62", "63", "64", "65", "66", "67", "70", "71", "72", "73", "74", "75", "98", "99"]),
    PISAliq: z.object({
        vBC: numberWithPrecisionSchema(2),
        pPIS: numberWithPrecisionSchema(4),
        vPIS: numberWithPrecisionSchema(2),
    }).optional(),
    PISQtde: z.object({
        qBCProd: numberWithPrecisionSchema(4),
        vAliqProd: numberWithPrecisionSchema(4),
        vPIS: numberWithPrecisionSchema(2),
    }).optional(),
    PISOutr: z.object({
        vBC: numberWithPrecisionSchema(2).optional(),
        pPIS: numberWithPrecisionSchema(4).optional(),
    }).optional(),
}).refine(
    (data) => {
        if (["01", "02"].includes(data.CST) && data.PISAliq === undefined) {
            return false;
        }
        return true;
    },
    {
        message: "Para grupo do CST = ('01', '02'), PISAliq é obrigatório",
        path: ["PISAliq"]
    }
).refine(
    (data) => {
        if (["03"].includes(data.CST) && data.PISQtde === undefined) {
            return false;
        }
        return true;
    },
    {
        message: "Para grupo do CST = '03', PISQtde é obrigatório",
        path: ["PISQtde"]
    }
);

export const pisSTSchema = z.object({
    calculo: z.union([
        z.object({
            vBC: numberWithPrecisionSchema(2),
            pPIS: numberWithPrecisionSchema(4),
        }),
        z.object({
            qBCProd: numberWithPrecisionSchema(4),
            vAliqProd: numberWithPrecisionSchema(4),
        })
    ]),
    vPIS: numberWithPrecisionSchema(2),
});

export const cofinsSchema = z.object({
    CST: z.enum(["01", "02", "03", "04", "05", "06", "07", "08", "09", "49", "50", "51", "52", "53", "54", "55", "56", "60", "61", "62", "63", "64", "65", "66", "67", "70", "71", "72", "73", "74", "75", "98", "99"]),
    COFINSAliq: z.object({
        vBC: numberWithPrecisionSchema(2),
        pCOFINS: numberWithPrecisionSchema(4),
        vCOFINS: numberWithPrecisionSchema(2),
    }).optional(),
    COFINSQtde: z.object({
        qBCProd: numberWithPrecisionSchema(4),
        vAliqProd: numberWithPrecisionSchema(4),
        vCOFINS: numberWithPrecisionSchema(2),
    }).optional(),
    COFINSOutr: z.object({
        calculo: z.union([
            z.object({
                vBC: numberWithPrecisionSchema(2).optional(),
                pCOFINS: numberWithPrecisionSchema(4).optional(),
            }),
            z.object({
                qBCProd: numberWithPrecisionSchema(4),
                vAliqProd: numberWithPrecisionSchema(4),
                vCOFINS: numberWithPrecisionSchema(2),
            })
        ])
    }).optional(),
    vCOFINS: numberWithPrecisionSchema(2),
}).refine(
    (data) => {
        if (["01", "02"].includes(data.CST) && data.COFINSAliq === undefined) {
            return false;
        }
        return true;
    },
    {
        message: "Para grupo do CST = ('01', '02'), COFINSAliq é obrigatório",
        path: ["COFINSAliq"]
    }
).refine(
    (data) => {
        if (["03"].includes(data.CST) && data.COFINSQtde === undefined) {
            return false;
        }
        return true;
    },
    {
        message: "Para grupo do CST = '03', COFINSQtde é obrigatório",
        path: ["COFINSQtde"]
    }
).refine(
    (data) => {
        if (["49", "50", "51", "52", "53", "54", "55", "56", "60", "61", "62", "63", "64", "65", "66", "67", "70", "71", "72", "73", "74", "75", "98", "99"].includes(data.CST) && data.COFINSQtde === undefined) {
            return false;
        }
        return true;
    },
    {
        message: "Para grupo do CST = ('49', '50', '51', '52', '53', '54', '55', '56', '60', '61', '62', '63', '64', '65', '66', '67', '70', '71', '72', '73', '74', '75', '98', '99'), COFINSOutr é obrigatório",
        path: ["COFINSOutr"]
    }
);

export const cofinsSTSchema = z.object({
    calculo: z.union([
        z.object({
            vBC: numberWithPrecisionSchema(2),
            pCOFINS: numberWithPrecisionSchema(4),
        }),
        z.object({
            qBCProd: numberWithPrecisionSchema(4),
            vAliqProd: numberWithPrecisionSchema(4),
        })
    ]),
    vCOFINS: numberWithPrecisionSchema(2),
});

export const issqnSchema = z.object({
    vBC: numberWithPrecisionSchema(2),
    vAliq: numberWithPrecisionSchema(4),
    vISSQN: numberWithPrecisionSchema(2),
    cMunFG: z.string().regex(/^\d{7}$/),
    cListServ: z.string().regex(/^\d{5}$/),
    vDeducao: numberWithPrecisionSchema(2).optional(),
    vOutro: numberWithPrecisionSchema(2).optional(),
    vDescIncond: numberWithPrecisionSchema(2).optional(),
    vDescCond: numberWithPrecisionSchema(2).optional(),
    vISSRet: numberWithPrecisionSchema(2).optional(),
    indISS: z.enum(["1", "2", "3", "4", "5", "6", "7"]),
    cServico: refinedStringSchema(1, 20).optional(),
    cMun: z.string().regex(/^\d{7}$/).optional(),
    cPais: z.number().int().optional(),
    nProcesso: refinedStringSchema(1, 30).optional(),
    indIncentivo: z.enum(["1", "2"]),
});

export const impostoDevolSchema = z.object({
    pDevol: numberWithPrecisionSchema(4),
    vIPIDevol: numberWithPrecisionSchema(2),
})


export const impostoSchema = z.object({
    vTotTrib: numberWithPrecisionSchema(2).optional(),
    icms: z.union([
        icms00Schema,
        icms10Schema,
        icms20Schema,
        icms30Schema,
        icms40Schema,
        icms51Schema,
        icms60Schema,
        icms70Schema,
        icms90Schema,
        icmsPartSchema,
        icmsSTSchema,
        icmsSN101Schema,
        icmsSN102Schema,
        icmsSN201Schema,
        icmsSN202Schema,
        icmsSN500Schema,
        icmsSN900Schema,
    ]),
    ICMSUFDest: icmsUFDestSchema.optional(),
    IPI: ipiSchema.optional(),
    II: iiSchema.optional(),
    PIS: pisSchema.optional(),
    PISST: pisSTSchema.optional(),
    COFINS: cofinsSchema.optional(),
    COFINSST: cofinsSTSchema.optional(),
    ISSQN: issqnSchema.optional(),
});


export const prodSchema = (ufEmitente: CodigoUF) => {
    return z.array(
        z.object({
            cProd: refinedStringSchema(1, 60).optional(),
            cEAN: cEanSchema.optional(),
            xProd: refinedStringSchema(1, 120),
            NCM: z.string().trim().length(8).optional(),
            NVE: z.array(z.string().length(6)).min(0).max(8).optional(),
            CEST: z.string().trim().length(7).optional(),
            indEscala: z.enum(['N', 'S']).optional(),
            CNPJFab: cnpjSchema,
            cBenef: z.union([
                z.string().length(8),
                z.string().length(10),
            ]).optional(),
            EXTIPI: z.number().int().gte(10).lte(999).optional(),
            CFOP: z.number().int().gte(1000).lte(9999),
            uCom: refinedStringSchema(1, 6),
            qCom: numberWithPrecisionSchema(4),
            vUnCom: numberWithPrecisionSchema(10),
            vProd: numberWithPrecisionSchema(2),
            cEANTrib: cEanSchema.optional(),
            uTrib: refinedStringSchema(1, 6),
            qTrib: numberWithPrecisionSchema(4),
            vUnTrib: numberWithPrecisionSchema(10),
            vFrete: numberWithPrecisionSchema(2).optional(),
            vSeg: numberWithPrecisionSchema(2).optional(),
            vDesc: numberWithPrecisionSchema(2).optional(),
            vOutro: numberWithPrecisionSchema(2).optional(),
            indTot: z.enum(["0", "1"]),
            DI: z.array(diSchema).min(1).max(100).optional(),
            detExport: z.array(detExportSchema).min(1).max(500).optional(),
            xPed: refinedStringSchema(1, 15).optional(),
            nItemPed: z.string().regex(/^\d{7}$/).optional(),
            nFCI: z.string().length(36).optional(),
            rastro: z.array(rastroSchema).min(1).min(500).optional(),
            produtoEspecifico: z.union([
                veicProdSchema,
                medSchema,
                armaSchema,
                combSchema,
                nRECOPISchema,
            ]).optional(),
            imposto: impostoSchema,
            impostoDevolSchema: impostoDevolSchema.optional(),
            infAdProd: refinedStringSchema(1, 500).optional(),
        }).refine(
            (data) => {
                if (data.CEST) {
                    if (data.indEscala == 'N' && data.CNPJFab == undefined) {
                        return false;
                    }
                }
                return true;
            },
            {
                message: "Para indEscala='N', CNPJFab é obrigatório",
                path: ["CNPJFab"]
            }
        ).refine(
            (data) => {
                if ([CodigoUFEnum.DF, CodigoUFEnum.ES, CodigoUFEnum.GO, CodigoUFEnum.PR, CodigoUFEnum.RS, CodigoUFEnum.RJ, CodigoUFEnum.SC].includes(ufEmitente) && data.cBenef === undefined) {
                    return false;
                }
                return true;
            },
            {
                message: `Para UF do Emitente='${ufEmitente}', cBenef é obrigatório`,
                path: ["cBenef"]
            }
        )
    ).min(1).max(990)
}

export const transpSchema = z.object({
    modFrete: z.enum(["0", "1", "2", "3", "4", "9"]),
    transporta: z.object({
        cpfCnpj: z.union([
            cnpjSchema,
            cpfSchema
        ]).optional(),
        xNome: refinedStringSchema(2, 60).optional(),
        IE: z.string().optional(), // TODO validação da IE
        xEnder: refinedStringSchema(1, 60).optional(),
        xMun: refinedStringSchema(1, 60).optional(),
        UF: z.union([
            ufSchema,
            z.enum(['EX']),
        ]).optional(),
    }).optional().refine(
        (data) => {
            if (data && data.IE && data.UF == undefined) {
                return false;
            }
            return true;
        },
        {
            message: "Para IE preenchida, UF é obrigatória",
            path: ["UF"]
        }
    ),
    retTransp: z.object({
        vServ: numberWithPrecisionSchema(2),
        vBCRet: numberWithPrecisionSchema(2),
        pICMSRet: numberWithPrecisionSchema(4),
        vICMSRet: numberWithPrecisionSchema(2),
        CFOP: z.number().int().gte(1000).lte(9999),
        cMunFG: z.string().regex(/^\d{7}$/),
    }).optional(),
    transpVeicVagaoBalsa: z.object({
        veicTransp: z.object({
            placa: refinedStringSchema(7, 7),
            UF: z.union([
                ufSchema,
                z.enum(['EX']),
            ]),
            RNTC: refinedStringSchema(1, 20).optional(),
        }).optional(),
        reboque: z.array(z.object({
            placa: refinedStringSchema(7, 7),
            UF: z.union([
                ufSchema,
                z.enum(['EX']),
            ]),
            RNTC: refinedStringSchema(1, 20).optional(),
        })).min(1).max(5).optional(),
        vagao: refinedStringSchema(1, 20).optional(),
        balsa: refinedStringSchema(1, 20).optional(),
    }).optional(),
    vol: z.array(z.object({
        qVol: numberWithPrecisionSchema(0).optional(),
        esp: refinedStringSchema(1, 60).optional(),
        marca: refinedStringSchema(1, 60).optional(),
        nVol: refinedStringSchema(1, 60).optional(),
        pesoL: numberWithPrecisionSchema(3).optional(),
        pesoB: numberWithPrecisionSchema(3).optional(),
        lacres: z.array(refinedStringSchema(1, 60)).min(1).max(5000).optional(),
    })).min(1).max(5000).optional(),
});

export const cobrSchema = z.object({
    fat: z.object({
        nFat: refinedStringSchema(1, 60).optional(),
        vOrig: numberWithPrecisionSchema(2).optional(),
        vDesc: numberWithPrecisionSchema(2).optional(),
        vLiq: numberWithPrecisionSchema(2).optional(),
    }).optional(),
    dup: z.array(z.object({
        nDup: z.number().int().positive().gt(0).lte(120).optional(),
        dVenc: dateSchema.optional(),
        vDup: numberWithPrecisionSchema(2),
    })).min(1).max(120).optional(),
})

export const pagSchema = z.object({
    detPag: z.array(z.object({
        indPag: z.enum(["0", "1"]).optional(),
        tPag: z.enum(["01", "02", "03", "04", "05", "10", "11", "12", "13", "15", "16", "17", "18", "19", "90", "99"]),
        vPag: numberWithPrecisionSchema(2),
        card: z.object({
            tpIntegra: z.enum(["1", "2"]),
            CNPJ: cnpjSchema.optional(),
            tBand: z.enum(["01", "02", "03", "04", "05", "06", "07", "08", "09", "99"]).optional(),
            cAut: refinedStringSchema(1, 20).optional(),
        }).optional(),
    })).min(1).max(100),
    vTroco: numberWithPrecisionSchema(2).optional(),
})

export const nfeSchema = (ufEmitente: CodigoUF) => z.object({
    ide: ideSchema,
    emit: emitSchema,
    dest: destSchema,
    retirada: retiradaSchema.optional(),
    entrega: entregaSchema.optional(),
    autXML: autXMLSchema.optional(),
    prod: prodSchema(ufEmitente),
    total: z.object({
        ICMSTot: z.object({
            vBC: numberWithPrecisionSchema(2),
            vICMS: numberWithPrecisionSchema(2),
            vICMSDeson: numberWithPrecisionSchema(2),
            vFCPUFDest: numberWithPrecisionSchema(2).optional(),
            vICMSUFDest: numberWithPrecisionSchema(2).optional(),
            vICMSUFRemet: numberWithPrecisionSchema(2).optional(),
            vFCP: numberWithPrecisionSchema(2),
            vBCST: numberWithPrecisionSchema(2),
            vST: numberWithPrecisionSchema(2),
            vFCPST: numberWithPrecisionSchema(2),
            vFCPSTRet: numberWithPrecisionSchema(2),
            vProd: numberWithPrecisionSchema(2),
            vFrete: numberWithPrecisionSchema(2),
            vSeg: numberWithPrecisionSchema(2),
            vDesc: numberWithPrecisionSchema(2),
            vII: numberWithPrecisionSchema(2),
            vIPI: numberWithPrecisionSchema(2),
            vIPIDevol: numberWithPrecisionSchema(2),
            vPIS: numberWithPrecisionSchema(2),
            vCOFINS: numberWithPrecisionSchema(2),
            vOutro: numberWithPrecisionSchema(2),
            vNF: numberWithPrecisionSchema(2),
            vTotTrib: numberWithPrecisionSchema(2).optional(),
        }),
        ISSQNtot: z.object({
            vServ: numberWithPrecisionSchema(2).optional(),
            vBC: numberWithPrecisionSchema(2).optional(),
            vISS: numberWithPrecisionSchema(2).optional(),
            vPIS: numberWithPrecisionSchema(2).optional(),
            vCOFINS: numberWithPrecisionSchema(2).optional(),
            dCompet: dateSchema,
            vDeducao: numberWithPrecisionSchema(2).optional(),
            vOutro: numberWithPrecisionSchema(2).optional(),
            vDescIncond: numberWithPrecisionSchema(2).optional(),
            vDescCond: numberWithPrecisionSchema(2).optional(),
            vISSRet: numberWithPrecisionSchema(2).optional(),
            cRegTrib: z.enum(["1", "2", "3", "4", "5", "6"]).optional(),
        }).optional(),
        retTrib: z.object({
            vRetPIS: numberWithPrecisionSchema(2).optional(),
            vRetCOFINS: numberWithPrecisionSchema(2).optional(),
            vRetCSLL: numberWithPrecisionSchema(2).optional(),
            vBCIRRF: numberWithPrecisionSchema(2).optional(),
            vIRRF: numberWithPrecisionSchema(2).optional(),
            vBCRetPrev: numberWithPrecisionSchema(2).optional(),
            vRetPrev: numberWithPrecisionSchema(2).optional(),
        }).optional(),
        transp: transpSchema,
        cobr: cobrSchema.optional(),
        pag: pagSchema,
        infIntermed: z.object({
            CNPJ: cnpjSchema,
            idCadIntTran: refinedStringSchema(60, 60),
        }).optional(),
        infAdic: z.object({
            infAdFisco: refinedStringSchema(1, 2000).optional(),
            infCpl: refinedStringSchema(1, 5000).optional(),
            obsCont: z.array(z.object({
                xCampo: refinedStringSchema(1, 20),
                xTexto: refinedStringSchema(1, 60),
            })).min(1).max(10).optional(),
            obsFisco: z.array(z.object({
                xCampo: refinedStringSchema(1, 20),
                xTexto: refinedStringSchema(1, 60),
            })).min(1).max(10).optional(),
            procRef: z.array(z.object({
                nProc: refinedStringSchema(1, 60),
                indProc: z.enum(["0", "1", "2", "3", "9"]),
            })).min(1).max(100).optional(),
        }).optional(),
        exporta: z.object({
            UFSaidaPais: ufSchema,
            xLocExporta: refinedStringSchema(1, 60),
            xLocDespacho: refinedStringSchema(1, 60).optional(),
        }).optional(),
        compra: z.object({
            xNEmp: refinedStringSchema(1, 22).optional(),
            xPed: refinedStringSchema(1, 60).optional(),
            xCont: refinedStringSchema(1, 60).optional(),
        }).optional(),
        cana: z.object({
            safra: z.string().regex(/^\d{4}(\/\d{4})?$/, {
                message: 'A safra deve estar no formato "AAAA" ou "AAAA/AAAA"',
            }),
            ref: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, {
                message: 'A referência deve estar no formato "MM/AAAA"',
            }),
            forDia: z.array(z.object({
                dia: z.number().int().gte(0).lte(99),
                qtde: numberWithPrecisionSchema(10),
                qTotMes: numberWithPrecisionSchema(10),
                qTotAnt: numberWithPrecisionSchema(10),
                qtqTotGerde: numberWithPrecisionSchema(10),
            })).min(1).max(31),
            deduc: z.array(z.object({
                xDed: refinedStringSchema(1, 60),
                vDed: numberWithPrecisionSchema(2),
                vFor: numberWithPrecisionSchema(2),
                vTotDed: numberWithPrecisionSchema(2),
                vLiqFor: numberWithPrecisionSchema(2),
            })).min(1).max(10).optional(),
        }).optional(),
    }),
})
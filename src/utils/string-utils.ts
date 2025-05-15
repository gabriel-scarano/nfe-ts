export function removeAccents(texto: string): string {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function validateCnpj(cnpj: string) {
    if (cnpj.length !== 14) {
        return false;
    }

    const corpo = cnpj.slice(0, 12);
    const dvInformado = cnpj.slice(12);

    const valores = corpo.split('').map(c => c.charCodeAt(0) - 48);

    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma1 = valores.reduce((acc, val, i) => acc + val * pesos1[i], 0);
    const resto1 = soma1 % 11;
    const dv1 = resto1 < 2 ? 0 : 11 - resto1;

    const valoresComDV1 = [...valores, dv1];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma2 = valoresComDV1.reduce((acc, val, i) => acc + val * pesos2[i], 0);
    const resto2 = soma2 % 11;
    const dv2 = resto2 < 2 ? 0 : 11 - resto2;

    const dvCalculado = `${dv1}${dv2}`;

    return dvInformado === dvCalculado;
}

export function validateCpf(cpf: string) {
    if (typeof cpf !== "string") return false;
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma1 = 0;
    for (let i = 0; i < 9; i++) {
        soma1 += parseInt(cpf[i]) * (10 - i);
    }
    let resto1 = soma1 % 11;
    let dv1 = resto1 < 2 ? 0 : 11 - resto1;

    let soma2 = 0;
    for (let i = 0; i < 10; i++) {
        soma2 += parseInt(cpf[i]) * (11 - i);
    }
    let resto2 = soma2 % 11;
    let dv2 = resto2 < 2 ? 0 : 11 - resto2;

    return parseInt(cpf[9]) === dv1 && parseInt(cpf[10]) === dv2;
}

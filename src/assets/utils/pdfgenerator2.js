import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/Images/senac-logo.png";

const atitudesList = [
  "Comprometimento com o atendimento humanizado",
  "Responsabilidade no uso dos recursos organizacionais",
  "Colaboração, flexibilidade e iniciativa no desenvolvimento do trabalho em equipe",
  "Proatividade na resolução de problemas",
  "Respeito à diversidade e aos valores morais, culturais e religiosos do cliente e da família",
  "Respeito ao limite da atuação profissional",
  "Responsabilidade no descarte de resíduos",
  "Sigilo no tratamento de dados e informações",
  "Zelo na apresentação pessoal e postura profissional",
  "Responsabilidade no cumprimento das normas de segurança",
  "Respeito às normas técnicas e legislações vigentes",
  "Escuta Ativa",
  "Registro das Ações de Enfermagem conforme a rotina e protocolo da Instituição",
];

function marcarOpcoes(valor, opcoes) {
  return opcoes
    .map((op) => (valor?.toLowerCase() === op.toLowerCase() ? `(X) ${op}` : `( ) ${op}`))
    .join("   ");
}

function formatarDataBR(isoDate) {
  const date = new Date(isoDate + "T00:00:00");
  return isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR");
}

function validarCamposObrigatorios({ uc, empresa, relatorio, checklist, tipo }) {
  const camposFaltantes = [];
  if (tipo === "Relatório") {
    if (!relatorio.nome) camposFaltantes.push("Nome do(a) aluno(a)");
    if (!relatorio.cpf) camposFaltantes.push("CPF do(a) aluno(a)");
    if (!relatorio.turma) camposFaltantes.push("Turma");
    if (!relatorio.instrutores) camposFaltantes.push("Nome do(s) instrutor(es)");
    if (!relatorio.habilidades || Object.keys(relatorio.habilidades).length === 0)
      camposFaltantes.push("Avaliação de Habilidades e Atitudes");
    if (!relatorio.conclusao) camposFaltantes.push("Conclusão do aluno");
  } else if (tipo === "Checklist") {
    if (!checklist.turma) camposFaltantes.push("Turma");
    if (!checklist.aluno) camposFaltantes.push("Nome do Aluno");
    if (!checklist.itens || Object.keys(checklist.itens).length === 0) camposFaltantes.push("Itens do Checklist");
    if (!checklist.resultado) camposFaltantes.push("Resultado Final");
  }
  if (camposFaltantes.length > 0) {
    alert(
      "Por favor, preencha os seguintes campos obrigatórios antes de gerar o PDF:\n\n- " +
        camposFaltantes.join("\n- ")
    );
    return false;
  }
  return true;
}

function getUcDetails(ucCode) {
  switch (ucCode) {
    case 'UC4':
      return { titulo: "Promoção à Saúde", carga: "80 horas" };
    case 'UC7':
      return { titulo: "Cuidado Integral de Enfermagem", carga: "120 horas" };
    case 'UC10':
      return { titulo: "Cuidado Especializado de Enfermagem", carga: "100 horas" };
    case 'UC17':
      return { titulo: "Cuidado Crítico, Urgência e Emergência de Enfermagem", carga: "100 horas" };
    default:
      return { titulo: "Título não definido", carga: "Carga não definida" };
  }
}

export default async function gerarPDF({ uc, empresa, relatorio, checklist, tipo }) {
  empresa = Array.isArray(empresa) ? empresa : [empresa];
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginSuperior = 30;
  const alturaCabecalho = 25;
  const marginInferior = 30;
  const marginEsquerda = 30;
  const marginDireita = 20;

  const contentStartY = marginSuperior + alturaCabecalho + 1;
  const contentAreaMaxY = pageHeight - marginInferior;

  const logoImg = new Image();
  logoImg.src = logo;
  await new Promise((resolve) => (logoImg.onload = resolve));

  function inserirCabecalho(titulo = "") {
    const ucDetails = getUcDetails(uc);
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.addImage(logoImg, "PNG", 8, 10, 22, 22);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text("SERVIÇO NACIONAL DE APRENDIZAGEM COMERCIAL – SENAC EM MINAS", pageWidth / 2, 18, { align: "center" });
    doc.text("Estágio Profissional Supervisionado", pageWidth / 2, 28, { align: "center" });
    doc.text(`Unidade Curricular ${uc} – ${ucDetails.titulo}`, pageWidth / 2, 38, { align: "center" });
    doc.text(`Carga horária: ${empresa[0]?.cargaHoraria || checklist?.cargaHoraria || ucDetails.carga}`, pageWidth / 2, 44, { align: "center" });
    if (titulo) {
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(titulo, marginEsquerda, 55);
      doc.setFont("times", "normal");
      doc.setFontSize(12);
    }
  }

  function iniciarNovaPagina(titulo) {
    doc.addPage();
    inserirCabecalho(titulo);
  }

  function corTexto(valor) {
    const v = valor?.toLowerCase();
    if (v === "sim") return [0, 128, 0];
    if (v === "não") return [255, 0, 0];
    if (v === "parcialmente") return [255, 165, 0];
    return [0, 0, 0];
  }

  function inserirRodape(numero) {
    const footerY = pageHeight - 10;
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${numero}`, pageWidth / 2, footerY, { align: "center" });
  }

  if (!validarCamposObrigatorios({ uc, empresa, relatorio, checklist, tipo })) return;

  function gerarCapa() {
    inserirCabecalho();
    const centerX = pageWidth / 2;
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("Relatório de Estágio Obrigatório", centerX, 160, { align: "center" });
    doc.text("Técnico em Enfermagem", centerX, 167, { align: "center" });
  }

  function gerarIdentificacao() {
    iniciarNovaPagina("IDENTIFICAÇÃO");
    const infoAluno = [
      [`Nome do(a) aluno(a): ${relatorio.nome || ""}`],
      [`CPF do(a) aluno(a): ${relatorio.cpf || ""}`],
      [`Turma: ${relatorio.turma || ""}`],
      [`Data da entrega: ${formatarDataBR(relatorio.dataEntrega || "")}`],
      [`Nome do(s) instrutor(es): ${relatorio.instrutores || ""}`],
    ];
    const infoEmpresasDetalhada = empresa.flatMap((e, index) => {
      const linhas = [`Unidade Concedente ${empresa.length > 1 ? index + 1 : ''}: ${e.nome || ""}`];
      if (e.dataInicio && e.dataFim) {
        linhas.push(`Período do Estágio: ${formatarDataBR(e.dataInicio)} a ${formatarDataBR(e.dataFim)}`);
      }
      return linhas;
    });
    const allInfo = [...infoAluno, ...infoEmpresasDetalhada].map(item => [item]);
    autoTable(doc, {
      startY: contentStartY,
      body: allInfo,
      styles: { font: "times", fontSize: 12, cellPadding: 3, halign: "left" },
      margin: { left: marginEsquerda, right: marginDireita },
      theme: "plain",
    });
  }

  function gerarIntroducao() {
    iniciarNovaPagina("INTRODUÇÃO");
    let currentY = contentStartY;
    const nomesEmpresas = empresa.map((e) => e.nome).filter(Boolean);
    const nomesJuntos = nomesEmpresas.join(" e ");
    const textoInicialGeral = `Este relatório tem como objetivo descrever as atividades realizadas, observadas e acompanhadas durante o estágio curricular no campo ${nomesJuntos}.`;
    autoTable(doc, {
      startY: currentY,
      body: [[textoInicialGeral]],
      styles: {
        font: "times",
        fontSize: 12,
        lineHeightFactor: 1.5,
        cellPadding: 0,
        halign: "justify",
        valign: "top",
        lineColor: [255, 255, 255],
        lineWidth: 0,
        overflow: "linebreak",
        cellWidth: pageWidth - marginEsquerda - marginDireita,
      },
      margin: { left: marginEsquerda, right: marginDireita },
      theme: "plain",
    });
    currentY = doc.lastAutoTable.finalY + 10;
    empresa.forEach((emp) => {
      const partesTextoEmpresa = [emp.info, emp.plano, emp.descricao].filter(Boolean);
      if (emp.dataInicio && emp.dataFim) {
        partesTextoEmpresa.push(`O estágio nesta unidade foi realizado de ${formatarDataBR(emp.dataInicio)} a ${formatarDataBR(emp.dataFim)}.`);
      }
      autoTable(doc, {
        startY: currentY,
        body: [[partesTextoEmpresa.join("\n\n")]],
        styles: {
          font: "times",
          fontSize: 12,
          lineHeightFactor: 1.5,
          cellPadding: 0,
          halign: "justify",
          valign: "top",
          lineColor: [255, 255, 255],
          lineWidth: 0,
          overflow: "linebreak",
          cellWidth: pageWidth - marginEsquerda - marginDireita,
        },
        margin: { left: marginEsquerda, right: marginDireita },
        theme: "plain",
      });
      currentY = doc.lastAutoTable.finalY + 10;
    });
  }

  function gerarHabilidades() {
    iniciarNovaPagina("HABILIDADES");
    autoTable(doc, {
      startY: contentStartY,
      head: [["Habilidade", "Avaliação"]],
      body: Object.entries(relatorio.habilidades || {})
        .filter(([h]) => !atitudesList.includes(h))
        .map(([titulo, val]) => [titulo, val]),
      styles: {
        font: "times",
        fontSize: 12,
        lineHeightFactor: 1.5,
        textColor: [0, 0, 0],
      },
      headStyles: { fillColor: [230, 230, 230], fontStyle: "bold" },
      columnStyles: {
        1: {
          halign: "center",
          textColor: (data) => corTexto(data.cell.raw),
        },
      },
      margin: { left: marginEsquerda, right: marginDireita },
      theme: "grid",
    });
  }

  function gerarAtitudes() {
    if (!relatorio.habilidades) return;
    const atitudesLinhas = atitudesList.map((a) => [a, relatorio.habilidades[a] || "Não informado"]);
    if (atitudesLinhas.length === 0) return;
    iniciarNovaPagina("ATITUDES / VALORES");
    autoTable(doc, {
      startY: contentStartY,
      head: [["Atitude / Valor", "Avaliação"]],
      body: atitudesLinhas,
      styles: {
        font: "times",
        fontSize: 12,
        lineHeightFactor: 1.5,
        textColor: [0, 0, 0],
      },
      headStyles: { fillColor: [230, 230, 230], fontStyle: "bold" },
      columnStyles: {
        1: {
          halign: "center",
          textColor: (data) => corTexto(data.cell.raw),
        },
      },
      margin: { left: marginEsquerda, right: marginDireita },
      theme: "grid",
    });
  }

  function gerarConclusao() {
    iniciarNovaPagina("CONCLUSÃO");
    const texto = relatorio.conclusao || "A experiência de estágio foi enriquecedora e fundamental para minha formação como Técnico em Enfermagem...";
    autoTable(doc, {
      startY: contentStartY,
      body: [[texto]],
      styles: {
        font: "times",
        fontSize: 12,
        lineHeightFactor: 1.5,
        cellPadding: 0,
        halign: "justify",
        valign: "top",
        lineColor: [255, 255, 255],
        lineWidth: 0,
        overflow: "linebreak",
        cellWidth: pageWidth - marginEsquerda - marginDireita,
      },
      margin: { left: marginEsquerda, right: marginDireita },
      theme: "plain",
    });
  }

  if (tipo === "Checklist") {
    iniciarNovaPagina("CHECKLIST DE ESTÁGIO");

    const dadosTopoChecklist = [
      ["Turma:", checklist.turma || "", "Matriz Curricular:", checklist.matrizCurricular || ""],
      ["Aluno:", checklist.aluno || "", "", ""],
      ["Unidade Curricular:", `${uc}`, "Carga Horária:", checklist.cargaHoraria || ""],
    ];
    autoTable(doc, {
      startY: contentStartY,
      body: dadosTopoChecklist,
      styles: { font: "times", fontSize: 10, cellPadding: 1 },
      theme: "grid",
      columnStyles: { 0: { cellWidth: 40 }, 2: { cellWidth: 40 } },
      margin: { left: marginEsquerda, right: marginDireita },
    });

    let currentYChecklist = doc.lastAutoTable.finalY + 5;
    const corpoTabelaChecklist = [];

    for (const [titulo, perguntas] of Object.entries(checklist.itens || {})) {
      corpoTabelaChecklist.push([
        { content: titulo, colSpan: 3, styles: { halign: "left", fontStyle: "bold", fillColor: [240, 240, 240] } }
      ]);
      for (const [pergunta, respostas] of Object.entries(perguntas)) {
        corpoTabelaChecklist.push([
          { content: pergunta },
          { content: marcarOpcoes(respostas.acesso, ["Sim", "Não"]), styles: { halign: "center" } },
          { content: marcarOpcoes(respostas.status, ["Regular", "Irregular", "Pendente"]), styles: { halign: "center" } }
        ]);
      }
    }

    autoTable(doc, {
      startY: currentYChecklist,
      head: [["Registro/Formulário", "Análise do Registro/Formulário", "Status"]],
      body: corpoTabelaChecklist,
      styles: { font: "times", fontSize: 9, textColor: [0, 0, 0], cellPadding: 2, lineHeightFactor: 1.2 },
      headStyles: { fillColor: [230, 230, 230], halign: 'center', fontStyle: 'bold', fontSize: 8, valign: 'middle' },
      theme: "grid",
      columnStyles: {
        0: { cellWidth: (pageWidth - marginEsquerda - marginDireita) * 0.6 },
        1: { cellWidth: (pageWidth - marginEsquerda - marginDireita) * 0.2 },
        2: { cellWidth: (pageWidth - marginEsquerda - marginDireita) * 0.2 }
      },
      margin: { left: marginEsquerda, right: marginDireita },
    });

    currentYChecklist = doc.lastAutoTable.finalY + 10;

    const resultadoFinal = marcarOpcoes(checklist.resultado, ["Desenvolvida", "Não Desenvolvida"]);
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Resultado Final: ${resultadoFinal}`, marginEsquerda, currentYChecklist);
    doc.text(`Carga Horária realizada: ______________________`, marginEsquerda + (pageWidth - marginEsquerda - marginDireita) * 0.5, currentYChecklist);

  } else if (tipo === "Relatório") {
    gerarCapa();
    gerarIdentificacao();
    gerarIntroducao();
    gerarHabilidades();
    gerarAtitudes();
    gerarConclusao();
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i >= 3) inserirRodape(i);
  }

  doc.save(`${tipo}_Estagio_${uc}.pdf`);
}

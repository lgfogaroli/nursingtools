// ===================================================================================
// ARQUIVO: pdfgenerator.js
// ===================================================================================

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function gerarPDF({ uc, empresa, relatorio, checklist, tipo }) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginEsquerda = 20;
  const marginDireita = 20;
  let currentY = 30;

  // Função utilitária
  const adicionarTitulo = (texto) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(texto, pageWidth / 2, currentY, { align: "center" });
    currentY += 10;
  };

  const adicionarParagrafo = (texto) => {
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(texto, pageWidth - marginEsquerda - marginDireita);
    doc.text(splitText, marginEsquerda, currentY);
    currentY += splitText.length * 7;
  };

  // ========== RELATÓRIO ==========
  if (tipo === "Relatório") {
    // CAPA
    const gerarCapa = () => {
      doc.setFont("times", "bold");
      doc.setFontSize(20);
      doc.text("Relatório de Estágio Supervisionado", pageWidth / 2, 100, { align: "center" });
      doc.setFontSize(16);
      doc.text(`Unidade Curricular: ${uc}`, pageWidth / 2, 115, { align: "center" });
      doc.addPage();
    };

    // IDENTIFICAÇÃO
    const gerarIdentificacao = () => {
      adicionarTitulo("1. Identificação das Instituições");
      empresa.forEach((e) => {
        adicionarParagrafo(`Empresa: ${e.nome}`);
        adicionarParagrafo(`RA: ${e.ra}`);
        adicionarParagrafo(`Polo: ${e.polo}`);
        adicionarParagrafo(`Período: ${e.periodo}`);
        adicionarParagrafo(`Ano Letivo: ${e.anoLetivo}`);
        adicionarParagrafo(`Setor: ${e.setor}`);
        adicionarParagrafo(`Plano: ${e.plano}`);
        adicionarParagrafo(`Descrição: ${e.descricao}`);
        adicionarParagrafo(`Período de Estágio: ${e.dataInicio} até ${e.dataFim}`);
        currentY += 5;
      });
      doc.addPage();
    };

    // INTRODUÇÃO
    const gerarIntroducao = () => {
      adicionarTitulo("2. Introdução");
      adicionarParagrafo(relatorio.introducao);
      doc.addPage();
    };

    // HABILIDADES
    const gerarHabilidades = () => {
      adicionarTitulo("3. Habilidades Desenvolvidas");
      autoTable(doc, {
        startY: currentY,
        head: [["Habilidade", "Desenvolvimento"]],
        body: relatorio.habilidades.map((h) => [h.nome, h.valor]),
        styles: { fontSize: 10 },
      });
      currentY = doc.lastAutoTable.finalY + 10;
      doc.addPage();
    };

    // ATITUDES
    const gerarAtitudes = () => {
      adicionarTitulo("4. Atitudes Demonstradas");
      autoTable(doc, {
        startY: currentY,
        head: [["Atitude", "Avaliação"]],
        body: relatorio.atitudes.map((a) => [a.nome, a.valor]),
        styles: { fontSize: 10 },
      });
      currentY = doc.lastAutoTable.finalY + 10;
      doc.addPage();
    };

    // CONCLUSÃO
    const gerarConclusao = () => {
      adicionarTitulo("5. Conclusão");
      adicionarParagrafo(relatorio.conclusao);
    };

    // Chamada das funções em sequência
    gerarCapa();
    gerarIdentificacao();
    gerarIntroducao();
    gerarHabilidades();
    gerarAtitudes();
    gerarConclusao();
  }

  // ========== CHECKLIST ==========
  else if (tipo === "Checklist") {
    doc.text("Checklist ainda em construção", 20, 30);
    // Aqui entra a lógica futura para o checklist
  }

  // Salvar PDF
  doc.save(`${tipo}_Estagio_${uc}.pdf`);
}

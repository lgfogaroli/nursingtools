// ===================================================================================
// ARQUIVO: FormularioEstagio.js (REESTRUTURADO PARA MELHOR USABILIDADE)
// ===================================================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import Theme from "../../components/Tema/tema";
import empresasData from "../../components/Const/empresas";
import RelatorioUC4 from "../../components/Relatorios/relatoriouc4";
import RelatorioUC7 from "../../components/Relatorios/relatoriouc7";
import RelatorioUC10 from "../../components/Relatorios/relatoriouc10";
import RelatorioUC17 from "../../components/Relatorios/relatoriouc17";
import ChecklistUC from "../../components/Checklist/checklistuc";
import gerarPDF from "../../assets/utils/pdfgenerator2";
import "../Formulário/form-index.css";

import { habilidadesUC4, atitudesUC4 } from "../../components/Relatorios/relatoriouc4";
import { habilidadesUC7, atitudesUC7 } from "../../components/Relatorios/relatoriouc7";
import { habilidadesUC10, atitudesUC10 } from "../../components/Relatorios/relatoriouc10";
import { habilidadesUC17, atitudesUC17 } from "../../components/Relatorios/relatoriouc17";

import { validarChecklist } from "../../assets/utils/validarChecklist";
import { validarRelatorio } from "../../assets/utils/validarRelatorio";

const ucs = ["UC4", "UC7", "UC10", "UC17"];
const abas = ["Relatório", "Checklist"];

export default function FormularioEstagio() {
  const [ucSelecionada, setUcSelecionada] = useState("UC4");
  const [abaAtiva, setAbaAtiva] = useState("Relatório");
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState([]);

  // MELHORIA DE ESTADO: Isola os dados de cada relatório e checklist
  const [dadosRelatorio, setDadosRelatorio] = useState({ UC4: {}, UC7: {}, UC10: {}, UC17: {} });
  const [dadosChecklist, setDadosChecklist] = useState({ UC4: {}, UC7: {}, UC10: {}, UC17: {} });

  const toggleEmpresa = (nome) => {
    const existe = empresasSelecionadas.find((e) => e.nome === nome);
    const atualizadas = existe
      ? empresasSelecionadas.filter((e) => e.nome !== nome)
      : [...empresasSelecionadas, { nome, ...empresasData[nome], dataInicio: "", dataFim: "" }];
    
    setEmpresasSelecionadas(atualizadas);
  };

  const handleEmpresaDateChange = (nomeEmpresa, tipoData, valor) => {
    setEmpresasSelecionadas((prevEmpresas) =>
      prevEmpresas.map((empresa) => {
        if (empresa.nome === nomeEmpresa) {
          const updatedEmpresa = { ...empresa, [tipoData]: valor };
          if (tipoData === 'dataInicio' && updatedEmpresa.dataFim && new Date(valor) > new Date(updatedEmpresa.dataFim)) {
            updatedEmpresa.dataFim = valor;
          }
          return updatedEmpresa;
        }
        return empresa;
      })
    );
  };

  const handleGerarPDF = () => {
    let habilidades = [], atitudes = [];
    const dadosAtuaisRelatorio = dadosRelatorio[ucSelecionada];
    const dadosAtuaisChecklist = dadosChecklist[ucSelecionada];

    // Validações... (a lógica interna permanece a mesma)
    const errosDeDataOrdem = empresasSelecionadas.reduce((erros, emp) => {
      if (emp.dataInicio && emp.dataFim && new Date(emp.dataFim) < new Date(emp.dataInicio)) {
        erros.push(`Em "${emp.nome}", a data final não pode ser anterior à data de início.`);
      }
      return erros;
    }, []);

    if (errosDeDataOrdem.length > 0) {
      alert("⚠️ Erro nas datas de estágio:\n\n" + errosDeDataOrdem.join("\n"));
      return;
    }

    if (abaAtiva === "Checklist") {
      const erros = validarChecklist(dadosAtuaisChecklist);
      if (erros.length > 0) {
        alert("⚠️ Corrija os erros no Checklist:\n\n" + erros.join("\n"));
        return;
      }
    }

    if (abaAtiva === "Relatório") {
      switch (ucSelecionada) {
        case "UC4": habilidades = habilidadesUC4; atitudes = atitudesUC4; break;
        case "UC7": habilidades = habilidadesUC7; atitudes = atitudesUC7; break;
        case "UC10": habilidades = habilidadesUC10; atitudes = atitudesUC10; break;
        case "UC17": habilidades = habilidadesUC17; atitudes = atitudesUC17; break;
        default: break;
      }

      if (empresasSelecionadas.length === 0) {
        alert("⚠️ Por favor, selecione pelo menos uma empresa e preencha as datas.");
        return;
      }
      
      const errosDeDataVazio = empresasSelecionadas.some(emp => !emp.dataInicio || !emp.dataFim);
      if (errosDeDataVazio) {
        alert("⚠️ Por favor, preencha as datas de início e fim para TODAS as empresas selecionadas.");
        return;
      }

      const nomesUnidades = empresasSelecionadas.map(e => e.nome).join(", ");
      const erros = validarRelatorio({ ...dadosAtuaisRelatorio, unidadeConcedente: nomesUnidades }, habilidades, atitudes);
      if (erros.length > 0) {
        alert("⚠️ Corrija os erros no Relatório:\n\n" + erros.join("\n"));
        return;
      }
    }
    
    // Gerar PDF com os dados corretos
    gerarPDF({
      uc: ucSelecionada,
      empresa: empresasSelecionadas,
      relatorio: dadosRelatorio[ucSelecionada],
      checklist: dadosChecklist[ucSelecionada],
      tipo: abaAtiva,
    });
  };

  // Função para renderizar o componente de relatório correto com os dados isolados
  const renderRelatorioUC = () => {
    const ComponenteRelatorio = {
      UC4: RelatorioUC4,
      UC7: RelatorioUC7,
      UC10: RelatorioUC10,
      UC17: RelatorioUC17,
    }[ucSelecionada];

    return ComponenteRelatorio ? (
      <ComponenteRelatorio
        dados={dadosRelatorio[ucSelecionada]}
        setDados={(data) => setDadosRelatorio(prev => ({ ...prev, [ucSelecionada]: data }))}
      />
    ) : null;
  };
  
  // Função para renderizar o componente de checklist correto com os dados isolados
  const renderChecklistUC = () => (
      <ChecklistUC
        uc={ucSelecionada}
        dados={dadosChecklist[ucSelecionada]}
        setDados={(data) => setDadosChecklist(prev => ({ ...prev, [ucSelecionada]: data }))}
      />
  );

  return (
    <main className="extra">
      
      





      <div className="home-content-box">
        {/* Header permanece o mesmo */}
        <div className="header-background">
            {/* ... seu código do header ... */}
        </div>

        <Theme />

        <div className="formulario-container-novo">
          <h2 className="titulo">Formulário de Estágio Supervisionado</h2>

          {/* ===== PASSO 1: SELEÇÃO PRINCIPAL ===== */}
          <div className="form-section">
            <h3 className="section-title">Passo 1: Selecione a UC e a Unidade</h3>
            
            <label className="form-label">Unidade Curricular (UC):</label>
            <div className="uc-tabs">
              {ucs.map((uc) => (
                <button
                  key={uc}
                  onClick={() => setUcSelecionada(uc)}
                  className={ucSelecionada === uc ? "ativo" : ""}
                >
                  {uc}
                </button>
              ))}
            </div>

            <label className="form-label" style={{ marginTop: '20px' }}>Unidade(s) Concedente(s):</label>
            <div className="lista-empresas-novo">
              {Object.keys(empresasData).map((nome) => (
                <label key={nome} className="empresa-checkbox">
                  <input
                    type="checkbox"
                    checked={empresasSelecionadas.some((e) => e.nome === nome)}
                    onChange={() => toggleEmpresa(nome)}
                  />
                  {nome}
                </label>
              ))}
            </div>
          </div>

          {/* ===== PASSO 2: CONFIGURAÇÃO DAS DATAS (SÓ APARECE SE HOUVER EMPRESA) ===== */}
          {empresasSelecionadas.length > 0 && (
            <div className="form-section">
              <h3 className="section-title">Passo 2: Defina o Período do Estágio</h3>
              {empresasSelecionadas.map((empresa) => (
                <div key={empresa.nome} className="empresa-date-picker">
                  <h4>{empresa.nome}</h4>
                  <div className="date-inputs">
                    <label>Início:</label>
                    <input
                      type="date"
                      value={empresa.dataInicio || ""}
                      onChange={(e) => handleEmpresaDateChange(empresa.nome, "dataInicio", e.target.value)}
                    />
                    <label>Fim:</label>
                    <input
                      type="date"
                      value={empresa.dataFim || ""}
                      min={empresa.dataInicio || ""}
                      onChange={(e) => handleEmpresaDateChange(empresa.nome, "dataFim", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== PASSO 3: PREENCHIMENTO DO DOCUMENTO ===== */}
          <div className="form-section">
            <h3 className="section-title">Passo 3: Preencha o Documento</h3>
            <div className="aba-tabs">
              {abas.map((aba) => (
                <button
                  key={aba}
                  onClick={() => setAbaAtiva(aba)}
                  className={abaAtiva === aba ? "ativo" : ""}
                >
                  {aba}
                </button>
              ))}
            </div>

            <div className="aba-conteudo">
              {abaAtiva === "Relatório" ? renderRelatorioUC() : renderChecklistUC()}
            </div>
          </div>

          {/* ===== PASSO 4: FINALIZAÇÃO ===== */}
          <div className="form-section-final">
            <button className="btn-enviar-novo" onClick={handleGerarPDF}>
              Gerar e Salvar PDF
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
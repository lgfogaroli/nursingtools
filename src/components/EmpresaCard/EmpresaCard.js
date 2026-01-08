// ===================================================================================
// ARQUIVO: EmpresaCard.js
// ===================================================================================

export default function EmpresaCard({ empresa, onDateChange }) {
  // Função interna para simplificar a chamada do onDateChange
  const handleDateChange = (tipoData, valor) => {
    onDateChange(empresa.nome, tipoData, valor);
  };

  return (
    <div className="info-empresa">
      <h3>{empresa.nome}</h3>
      
      {/* Detalhes da empresa em uma grade para melhor visualização */}
      <div className="detalhes-grid">
        <p><strong>RA:</strong> {empresa.ra}</p>
        <p><strong>Polo:</strong> {empresa.polo}</p>
        <p><strong>Setor:</strong> {empresa.setor}</p>
        <p><strong>Ano Letivo:</strong> {empresa.anoLetivo}</p>
        <p><strong>Plano:</strong> {empresa.plano}</p>
        <p><strong>Descrição:</strong> {empresa.descricao}</p>
      </div>

      {/* Seção de datas mais organizada */}
      <div className="periodo-estagio-empresa">
        <div className="campo-data">
          <label htmlFor={`dataInicio-${empresa.nome}`}>
            <strong>Início do Estágio:</strong>
          </label>
          <input
            id={`dataInicio-${empresa.nome}`}
            type="date"
            value={empresa.dataInicio || ""}
            onChange={(e) => handleDateChange("dataInicio", e.target.value)}
          />
        </div>
        <div className="campo-data">
          <label htmlFor={`dataFim-${empresa.nome}`}>
            <strong>Fim do Estágio:</strong>
          </label>
          <input
            id={`dataFim-${empresa.nome}`}
            type="date"
            value={empresa.dataFim || ""}
            onChange={(e) => handleDateChange("dataFim", e.target.value)}
            min={empresa.dataInicio || ""}
          />
        </div>
      </div>
      <hr style={{ margin: '15px 0' }} />
    </div>
  );
}
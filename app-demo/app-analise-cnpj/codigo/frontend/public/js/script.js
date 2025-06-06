$(document).ready(function() {
  // Inicialização de máscara para o campo CNPJ
  $('#cnpj').mask('00.000.000/0000-00');

  // Variáveis para armazenar dados da última consulta
  let lastCnpj = '';
  let forceUpdate = false;

  // Handler para o botão de análise
  $('#analisarBtn').on('click', function() {
    analisarCnpj();
  });

  // Handler para o campo de CNPJ (permitir Enter)
  $('#cnpj').on('keypress', function(e) {
    if (e.which === 13) {
      analisarCnpj();
    }
  });

  // Handler para o botão de nova consulta
  $('#novaConsultaBtn').on('click', function() {
    resetarFormulario();
  });

  // Handler para o botão de forçar atualização
  $('#forceUpdateBtn').on('click', function() {
    forceUpdate = true;
    analisarCnpj();
  });

  /**
   * Função para analisar o CNPJ inserido
   */
  function analisarCnpj() {
    // Obter CNPJ digitado
    const cnpj = $('#cnpj').val();
    
    // Validar formato
    if (!validarCnpj(cnpj)) {
      $('#cnpj').addClass('is-invalid');
      $('#cnpjError').text('CNPJ inválido. Verifique o formato e os dígitos verificadores.');
      return;
    }
    
    // Remover mensagens de erro
    $('#cnpj').removeClass('is-invalid');
    $('#cnpjError').text('');
    
    // Armazenar CNPJ para verificar se é o mesmo da última consulta
    lastCnpj = cnpj;
    
    // Mostrar loading
    mostrarSecao('loadingSection');
    
    // Fazer requisição para a API
    $.ajax({
      url: '/api/cnpj',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        cnpj: cnpj,
        forceUpdate: forceUpdate
      }),
      success: function(data) {
        // Resetar flag de forçar atualização
        forceUpdate = false;
        
        // Processar e exibir resultados
        exibirResultados(data);
      },
      error: function(xhr) {
        // Resetar flag de forçar atualização
        forceUpdate = false;
        
        // Exibir mensagem de erro
        let mensagem = 'Erro ao processar a consulta.';
        
        if (xhr.responseJSON && xhr.responseJSON.erro) {
          mensagem = xhr.responseJSON.erro;
        }
        
        $('#errorMessage').text(mensagem);
        mostrarSecao('errorSection');
      }
    });
  }

  /**
   * Exibe os resultados da consulta
   */
  function exibirResultados(data) {
    // Preencher dados cadastrais
    $('#resultCnpj').text(data.cnpj_formatado || formatarCnpj(data.cnpj));
    $('#resultRazaoSocial').text(data.razao_social || 'Não informado');
    $('#resultSituacao').text(data.situacao_cadastral || 'Não informado');
    $('#resultDataAbertura').text(formatarData(data.data_abertura) || 'Não informado');
    $('#resultCnae').text(`${data.cnae_principal} - ${data.descricao_cnae}` || 'Não informado');
    $('#resultPorte').text(data.porte_empresa || 'Não informado');
    $('#resultMunicipio').text(data.municipio || 'Não informado');
    $('#resultUf').text(data.uf || 'Não informado');
    
    // Preencher classificação de risco
    $('#resultScore').text(data.score);
    $('#riscoTexto').text(data.classificacao_risco);
    
    // Definir cor do badge conforme classificação
    const riscoBadge = $('#riscoBadge');
    riscoBadge.removeClass('low medium high');
    
    if (data.classificacao_risco === 'Baixo Risco') {
      riscoBadge.addClass('low');
    } else if (data.classificacao_risco === 'Médio Risco') {
      riscoBadge.addClass('medium');
    } else {
      riscoBadge.addClass('high');
    }
    
    // Preencher sinais de alerta
    const listaAlerta = $('#listaAlerta');
    listaAlerta.empty();
    
    // Verificar sinais de alerta com base nos critérios negativos
    let temAlerta = false;
    
    if (data.criterios && data.criterios.length > 0) {
      data.criterios.forEach(criterio => {
        if (criterio.pontuacao < 0) {
          temAlerta = true;
          listaAlerta.append(`<li>${criterio.criterio}</li>`);
        }
      });
    }
    
    // Se não houver alertas, exibir mensagem
    if (!temAlerta) {
      listaAlerta.append('<li>Nenhum sinal de alerta identificado</li>');
    }
    
    // Preencher critérios aplicados
    const criteriosList = $('#criteriosList');
    criteriosList.empty();
    
    if (data.criterios && data.criterios.length > 0) {
      data.criterios.forEach(criterio => {
        const pontuacaoClass = criterio.pontuacao >= 0 ? 'pontuacao-positiva' : 'pontuacao-negativa';
        const pontuacaoPrefix = criterio.pontuacao >= 0 ? '+' : '';
        
        criteriosList.append(`
          <li class="list-group-item">
            <span>${criterio.criterio}</span>
            <span class="${pontuacaoClass}">${pontuacaoPrefix}${criterio.pontuacao}</span>
          </li>
        `);
      });
    } else {
      criteriosList.append('<li class="list-group-item">Nenhum critério aplicado</li>');
    }
    
    // Verificar se os dados são de cache e exibir alerta
    if (data.fromCache) {
      const dataConsulta = new Date(data.data_consulta);
      $('#cacheDate').text(formatarDataHora(dataConsulta));
      $('#cacheAlert').removeClass('d-none');
    } else {
      $('#cacheAlert').addClass('d-none');
    }
    
    // Exibir seção de resultados
    mostrarSecao('resultSection');
  }

  /**
   * Mostra apenas a seção especificada e esconde as outras
   */
  function mostrarSecao(secaoId) {
    $('#formSection, #loadingSection, #resultSection, #errorSection').addClass('d-none');
    $(`#${secaoId}`).removeClass('d-none');
  }

  /**
   * Reseta o formulário para uma nova consulta
   */
  function resetarFormulario() {
    $('#cnpj').val('').removeClass('is-invalid');
    $('#cnpjError').text('');
    $('#errorMessage').text('');
    $('#cacheAlert').addClass('d-none');
    forceUpdate = false;
    mostrarSecao('formSection');
  }

  /**
   * Valida um CNPJ
   */
  function validarCnpj(cnpj) {
    // Remover caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    // Verificar se tem 14 dígitos
    if (cnpj.length !== 14) {
      return false;
    }
    
    // Verificar se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1+$/.test(cnpj)) {
      return false;
    }
    
    // Algoritmo de validação do dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    // Validação do primeiro dígito
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    
    if (resultado != digitos.charAt(0)) {
      return false;
    }
    
    // Validação do segundo dígito
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    
    if (resultado != digitos.charAt(1)) {
      return false;
    }
    
    return true;
  }

  /**
   * Formata um CNPJ para exibição
   */
  function formatarCnpj(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) {
      return cnpj;
    }
    
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata uma data para exibição
   */
  function formatarData(dataStr) {
    if (!dataStr) return '';
    
    const data = new Date(dataStr);
    
    if (isNaN(data.getTime())) {
      return dataStr;
    }
    
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    
    return `${dia}/${mes}/${ano}`;
  }

  /**
   * Formata uma data e hora para exibição
   */
  function formatarDataHora(data) {
    if (!data) return '';
    
    if (isNaN(data.getTime())) {
      return data.toString();
    }
    
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
  }
});
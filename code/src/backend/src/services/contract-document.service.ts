import { Contract, Service, Supplier, ClientProfile, User, Profile } from '@prisma/client';
import { logger } from '../config/logger';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Define types for contract document generation
type ContractWithRelations = Contract & {
  service: Service & {
    supplier: Supplier & {
      user: {
        id: string;
        email: string;
        profile: Profile;
      };
    };
  };
  client: ClientProfile & {
    user: {
      id: string;
      email: string;
      profile: Profile;
    };
  };
};

interface ContractDocumentOptions {
  includeSignatures?: boolean;
  includeTerms?: boolean;
  includeFooter?: boolean;
}

/**
 * Service for generating contract documents
 */
export class ContractDocumentService {
  /**
   * Generate contract document as HTML
   * @param contract Contract with all relations
   * @param options Document generation options
   * @returns HTML string of the contract document
   */
  static generateContractHtml(contract: ContractWithRelations, options: ContractDocumentOptions = {}): string {
    const {
      includeSignatures = true,
      includeTerms = true,
      includeFooter = true,
    } = options;

    try {
      // Create date formatter
      const formatDate = (date: Date | string | null) => {
        if (!date) return 'N/A';
        
        try {
          const d = new Date(date);
          return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
        } catch (e) {
          return String(date);
        }
      };

      // Generate contract hash for verification
      const contractHash = this.generateContractHash(contract);
      
      // Generate contract document HTML
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Contrato de Serviço - ${contract.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 10px;
              border-bottom: 1px solid #ddd;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2196f3;
            }
            h1 {
              font-size: 22px;
              text-align: center;
              margin-bottom: 20px;
            }
            h2 {
              font-size: 18px;
              margin-top: 30px;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 1px solid #eee;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            table, th, td {
              border: 1px solid #ddd;
            }
            th, td {
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .signatures {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature {
              width: 45%;
              border-top: 1px solid #000;
              padding-top: 10px;
              text-align: center;
            }
            .verification {
              margin-top: 30px;
              padding: 15px;
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 100px;
              opacity: 0.05;
              z-index: -1;
              color: #000;
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          <div class="watermark">CONTRATO</div>
          <div class="container">
            <div class="header">
              <div class="logo">MARKETPLACE DE BENEFÍCIOS</div>
              <p>Contrato de Prestação de Serviços</p>
            </div>
            
            <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
            
            <p>
              <strong>Código do Contrato:</strong> ${contract.id}<br>
              <strong>Data de Emissão:</strong> ${formatDate(contract.createdAt)}
            </p>
            
            <h2>1. PARTES</h2>
            
            <h3>1.1 CONTRATANTE</h3>
            <p>
              <strong>Razão Social:</strong> ${contract.client.companyName || 'N/A'}<br>
              <strong>CNPJ:</strong> ${contract.client.cnpj || 'N/A'}<br>
              <strong>Endereço:</strong> ${contract.client.address || 'N/A'}<br>
              <strong>Representante Legal:</strong> ${contract.client.user.profile?.name || contract.client.user.email}<br>
              <strong>Email:</strong> ${contract.client.user.email}
            </p>
            
            <h3>1.2 CONTRATADA</h3>
            <p>
              <strong>Razão Social:</strong> ${contract.service.supplier.companyName || 'N/A'}<br>
              <strong>CNPJ:</strong> ${contract.service.supplier.cnpj || 'N/A'}<br>
              <strong>Endereço:</strong> ${contract.service.supplier.address || 'N/A'}<br>
              <strong>Representante Legal:</strong> ${contract.service.supplier.user.profile?.name || contract.service.supplier.user.email}<br>
              <strong>Email:</strong> ${contract.service.supplier.user.email}
            </p>
            
            <h2>2. OBJETO DO CONTRATO</h2>
            
            <p>
              O presente contrato tem por objeto a prestação do serviço "${contract.service.title}" pela CONTRATADA ao CONTRATANTE, 
              conforme detalhamento e especificações técnicas apresentadas na plataforma.
            </p>
            
            <h3>2.1 Descrição do Serviço</h3>
            <p>${contract.service.description}</p>
            
            ${contract.service.features && contract.service.features.length > 0 ? `
              <h3>2.2 Características Incluídas</h3>
              <ul>
                ${contract.service.features.map((feature: string) => `<li>${feature}</li>`).join('')}
              </ul>
            ` : ''}
            
            <h2>3. PRAZO</h2>
            
            <p>
              3.1 O presente contrato terá vigência de ${
                contract.endDate 
                  ? Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) 
                  : 'N/A'
              } meses, 
              com início em ${formatDate(contract.startDate)} e término em ${formatDate(contract.endDate)}.
            </p>
            
            <p>
              3.2 Ao final do prazo de vigência, o contrato será automaticamente renovado por períodos iguais e sucessivos, 
              salvo manifestação em contrário por qualquer das partes, com antecedência mínima de 30 (trinta) dias.
            </p>
            
            <h2>4. PREÇO E FORMA DE PAGAMENTO</h2>
            
            <p>
              4.1 Pela prestação dos serviços objeto deste contrato, o CONTRATANTE pagará à CONTRATADA o valor de 
              R$ ${contract.totalPrice.toFixed(2)} (${this.numberToWords(contract.totalPrice)}).
            </p>
            
            <p>
              4.2 O pagamento será realizado ${
                contract.metadata?.paymentMethod === 'bank_account' ? 'via débito em conta' : 
                contract.metadata?.paymentMethod === 'boleto' ? 'via boleto bancário' : 
                contract.metadata?.paymentMethod === 'credit_card' ? 'via cartão de crédito' : 'conforme acordado entre as partes'
              }.
            </p>
            
            ${includeTerms ? `
              <h2>5. OBRIGAÇÕES DAS PARTES</h2>
              
              <h3>5.1 São obrigações do CONTRATANTE:</h3>
              <ul>
                <li>Pagar pontualmente o preço pelos serviços contratados;</li>
                <li>Fornecer todas as informações necessárias para a execução dos serviços;</li>
                <li>Utilizar os serviços de acordo com os termos deste contrato.</li>
              </ul>
              
              <h3>5.2 São obrigações da CONTRATADA:</h3>
              <ul>
                <li>Prestar os serviços conforme especificado na plataforma;</li>
                <li>Manter sigilo sobre as informações do CONTRATANTE;</li>
                <li>Prestar suporte técnico nos termos contratados.</li>
              </ul>
              
              ${contract.service.sla ? `
                <h3>5.3 Acordo de Nível de Serviço (SLA)</h3>
                <p>${contract.service.sla}</p>
              ` : ''}
              
              <h2>6. RESCISÃO</h2>
              
              <p>6.1 O presente contrato poderá ser rescindido nas seguintes hipóteses:</p>
              <ul>
                <li>Por acordo entre as partes;</li>
                <li>Pelo descumprimento de qualquer cláusula contratual;</li>
                <li>Mediante aviso prévio de 30 dias por qualquer das partes.</li>
              </ul>
              
              <h2>7. DISPOSIÇÕES GERAIS</h2>
              
              <p>
                7.1 As partes elegem o foro da comarca de São Paulo, SP, para dirimir quaisquer dúvidas oriundas do presente contrato.
              </p>
              
              <p>
                7.2 Este contrato está sujeito aos Termos e Condições Gerais da plataforma Marketplace de Benefícios para Clientes PJ, 
                que são parte integrante deste documento.
              </p>
            ` : ''}
            
            ${includeSignatures ? `
              <div class="signatures">
                <div class="signature">
                  <p>
                    ${contract.client.user.profile?.name || contract.client.user.email}<br>
                    CONTRATANTE<br>
                    ${contract.client.companyName || 'N/A'}<br>
                    CNPJ: ${contract.client.cnpj || 'N/A'}
                  </p>
                </div>
                
                <div class="signature">
                  <p>
                    ${contract.service.supplier.user.profile?.name || contract.service.supplier.user.email}<br>
                    CONTRATADA<br>
                    ${contract.service.supplier.companyName || 'N/A'}<br>
                    CNPJ: ${contract.service.supplier.cnpj || 'N/A'}
                  </p>
                </div>
              </div>
            ` : ''}
            
            <div class="verification">
              <p>
                <strong>Verificação de Autenticidade</strong><br>
                Contrato Nº: ${contract.id}<br>
                Hash de Verificação: ${contractHash}<br>
                Status do Contrato: ${contract.status}<br>
                Data da Última Atualização: ${formatDate(contract.updatedAt)}
              </p>
            </div>
            
            ${includeFooter ? `
              <div class="footer">
                <p>
                  Marketplace de Benefícios para Clientes PJ<br>
                  Este documento foi gerado eletronicamente e é válido sem assinatura física.<br>
                  Data de Geração: ${new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            ` : ''}
          </div>
        </body>
        </html>
      `;
      
      return html;
    } catch (error) {
      logger.error('Error generating contract document:', error);
      throw new Error('Erro ao gerar documento do contrato');
    }
  }

  /**
   * Generate hash for contract verification
   * @param contract Contract data
   * @returns Hash string
   */
  static generateContractHash(contract: Contract): string {
    try {
      const contractData = JSON.stringify({
        id: contract.id,
        clientId: contract.clientId,
        serviceId: contract.serviceId,
        totalPrice: contract.totalPrice,
        startDate: contract.startDate,
        endDate: contract.endDate,
        createdAt: contract.createdAt,
      });
      
      const hash = crypto.createHash('sha256').update(contractData).digest('hex');
      return hash.substring(0, 16).toUpperCase();
    } catch (error) {
      logger.error('Error generating contract hash:', error);
      throw new Error('Erro ao gerar hash do contrato');
    }
  }

  /**
   * Save contract document to disk
   * @param contractId Contract ID
   * @param html HTML document content
   * @returns Path to saved file
   */
  static saveContractDocument(contractId: string, html: string): string {
    try {
      // Create directory if it doesn't exist
      const contractsDir = path.join(__dirname, '../../contracts');
      if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
      }
      
      const filePath = path.join(contractsDir, `${contractId}.html`);
      fs.writeFileSync(filePath, html);
      
      return filePath;
    } catch (error) {
      logger.error('Error saving contract document:', error);
      throw new Error('Erro ao salvar documento do contrato');
    }
  }

  /**
   * Convert number to words (for contract amount)
   * @param num Number to convert
   * @returns Number in words
   */
  private static numberToWords(num: number): string {
    const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const scales = ['', 'mil', 'milhão', 'bilhão'];
    
    if (num === 0) return 'zero reais';
    
    // Split integer and decimal parts
    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    
    // Convert integer part to words
    const intToWords = (n: number): string => {
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        const unit = n % 10;
        return unit ? `${tens[Math.floor(n / 10)]} e ${units[unit]}` : tens[Math.floor(n / 10)];
      }
      if (n < 1000) {
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        const hundredStr = hundred === 1 ? 'cem' : `${units[hundred]} centos`;
        return remainder ? `${hundredStr} e ${intToWords(remainder)}` : hundredStr;
      }
      
      // Handle larger numbers
      let words = '';
      let i = 0;
      while (n > 0) {
        const chunk = n % 1000;
        if (chunk > 0) {
          const scaleWord = i > 0 ? (chunk > 1 ? `${scales[i]}ões` : scales[i]) : scales[i];
          words = `${intToWords(chunk)} ${scaleWord}${words ? ' e ' + words : ''}`;
        }
        n = Math.floor(n / 1000);
        i++;
      }
      return words;
    };
    
    // Build final string
    let result = intToWords(intPart);
    result += intPart === 1 ? ' real' : ' reais';
    
    if (decPart > 0) {
      result += ' e ' + intToWords(decPart);
      result += decPart === 1 ? ' centavo' : ' centavos';
    }
    
    return result;
  }
}
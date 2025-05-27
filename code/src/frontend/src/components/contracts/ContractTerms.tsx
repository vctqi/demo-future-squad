import React from 'react';
import {
  Typography,
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
} from '@mui/material';

interface ContractTermsProps {
  service: any;
  contractData: any;
  termsAccepted: boolean;
  onTermsAcceptedChange: (accepted: boolean) => void;
}

const ContractTerms: React.FC<ContractTermsProps> = ({
  service,
  contractData,
  termsAccepted,
  onTermsAcceptedChange,
}) => {
  // Generate mock terms based on service data
  const generateTerms = (service: any) => {
    const baseTerms = `
TERMOS E CONDIÇÕES DE CONTRATAÇÃO

1. OBJETO DO CONTRATO

1.1 O presente contrato tem por objeto a prestação do serviço "${service?.title || 'Serviço'}" pela CONTRATADA ao CONTRATANTE, conforme detalhamento e especificações técnicas apresentadas na plataforma.

2. PRAZO

2.1 O presente contrato terá vigência de ${contractData.selectedPlan?.duration || 1} ${(contractData.selectedPlan?.duration || 1) === 1 ? 'mês' : 'meses'}, com início em ${new Date(contractData.startDate).toLocaleDateString('pt-BR')}.

2.2 Ao final do prazo de vigência, o contrato será automaticamente renovado por períodos iguais e sucessivos, salvo manifestação em contrário por qualquer das partes, com antecedência mínima de 30 (trinta) dias.

3. PREÇO E FORMA DE PAGAMENTO

3.1 Pela prestação dos serviços objeto deste contrato, o CONTRATANTE pagará à CONTRATADA o valor de R$ ${contractData.selectedPlan?.price.toFixed(2) || service?.price.toFixed(2) || '0.00'} (${valorPorExtenso(contractData.selectedPlan?.price || service?.price || 0)}).

3.2 O pagamento será realizado antecipadamente, mediante débito em conta ou boleto bancário.

4. OBRIGAÇÕES DAS PARTES

4.1 São obrigações do CONTRATANTE:
a) Pagar pontualmente o preço pelos serviços contratados;
b) Fornecer todas as informações necessárias para a execução dos serviços;
c) Utilizar os serviços de acordo com os termos deste contrato.

4.2 São obrigações da CONTRATADA:
a) Prestar os serviços conforme especificado na plataforma;
b) Manter sigilo sobre as informações do CONTRATANTE;
c) Prestar suporte técnico nos termos contratados.

5. RESCISÃO

5.1 O presente contrato poderá ser rescindido nas seguintes hipóteses:
a) Por acordo entre as partes;
b) Pelo descumprimento de qualquer cláusula contratual;
c) Mediante aviso prévio de 30 dias por qualquer das partes.

6. DISPOSIÇÕES GERAIS

6.1 As partes elegem o foro da comarca de São Paulo, SP, para dirimir quaisquer dúvidas oriundas do presente contrato.
`;

    // Add service-specific terms if available
    if (service?.terms) {
      return `${baseTerms}\n\nTERMOS ESPECÍFICOS DO SERVIÇO\n\n${service.terms}`;
    }
    
    return baseTerms;
  };
  
  // Helper function to convert number to written form (simplified)
  function valorPorExtenso(valor: number): string {
    if (valor === 0) return 'zero reais';
    
    const valorInteiro = Math.floor(valor);
    const centavos = Math.round((valor - valorInteiro) * 100);
    
    let resultado = '';
    
    if (valorInteiro === 1) {
      resultado = 'um real';
    } else if (valorInteiro > 1) {
      resultado = `${valorInteiro} reais`;
    }
    
    if (centavos > 0) {
      if (resultado) {
        resultado += ` e ${centavos} centavo${centavos !== 1 ? 's' : ''}`;
      } else {
        resultado = `${centavos} centavo${centavos !== 1 ? 's' : ''}`;
      }
    }
    
    return resultado;
  }
  
  const terms = generateTerms(service);
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Termos e Condições
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Leia atentamente os termos e condições antes de prosseguir com a contratação.
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Este é um contrato simulado para fins de demonstração. Em um ambiente real, os termos seriam 
        elaborados por uma equipe jurídica e personalizados para cada tipo de serviço.
      </Alert>
      
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          maxHeight: 400,
          overflow: 'auto',
          mb: 3,
          bgcolor: 'background.default',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
        }}
      >
        {terms}
      </Paper>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        Ao aceitar os termos, você concorda com todas as condições acima e autoriza a contratação do serviço.
      </Alert>
      
      <Divider sx={{ my: 2 }} />
      
      <FormControlLabel
        control={
          <Checkbox
            checked={termsAccepted}
            onChange={(e) => onTermsAcceptedChange(e.target.checked)}
            color="primary"
          />
        }
        label="Li e aceito os termos e condições de contratação"
      />
    </Box>
  );
};

export default ContractTerms;
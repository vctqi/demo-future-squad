import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton,
  CircularProgress,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  label?: string;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  maxFiles = 5,
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxFileSize = 5, // 5MB default
  label = 'Arraste arquivos ou clique para selecionar',
  error
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(Array.from(event.target.files));
      // Reset input so same file can be selected again if removed
      event.target.value = '';
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const errors: string[] = [];
    const validFiles: File[] = [];
    
    // Check if we'd exceed max files
    if (files.length + newFiles.length > maxFiles) {
      errors.push(`Você pode fazer upload de no máximo ${maxFiles} arquivos.`);
      // Only add files up to max limit
      newFiles = newFiles.slice(0, maxFiles - files.length);
    }
    
    // Validate each file
    newFiles.forEach(file => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name}: Tamanho excede ${maxFileSize}MB`);
        return;
      }
      
      // Check file type by extension
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedFileTypes.includes(fileExtension)) {
        errors.push(`${file.name}: Tipo de arquivo não permitido`);
        return;
      }
      
      // Check for duplicate files by name
      if (files.some(f => f.name === file.name)) {
        errors.push(`${file.name}: Arquivo já adicionado`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
    
    setFileErrors(errors);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFiles(Array.from(event.dataTransfer.files));
    }
  };

  // Determine icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return <PictureAsPdfIcon color="error" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
      return <ImageIcon color="primary" />;
    } else {
      return <InsertDriveFileIcon color="action" />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        variant="outlined"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : error ? 'error.main' : 'divider',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          backgroundColor: isDragging ? 'action.hover' : 'background.paper',
          cursor: 'pointer'
        }}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept={acceptedFileTypes}
        />
        
        <CloudUploadIcon fontSize="large" color={error ? 'error' : 'primary'} />
        
        <Typography variant="h6" sx={{ mt: 1 }}>
          {label}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Formatos aceitos: {acceptedFileTypes.replace(/\./g, '').replace(/,/g, ', ')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Tamanho máximo: {maxFileSize}MB | Máximo de {maxFiles} arquivos
        </Typography>
      </Paper>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
      
      {fileErrors.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {fileErrors.map((error, index) => (
            <Typography key={index} variant="caption" color="error" display="block">
              {error}
            </Typography>
          ))}
        </Box>
      )}
      
      {files.length > 0 && (
        <List>
          {files.map((file, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete" 
                  onClick={() => handleRemoveFile(index)}
                  disabled={isUploading}
                >
                  <DeleteIcon />
                </IconButton>
              }
              sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemIcon>
                {getFileIcon(file.name)}
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={`${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                primaryTypographyProps={{
                  sx: { 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' 
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
      
      {isUploading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Enviando arquivos...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
import { useState } from 'react';
import { AssociatedDoc } from '../types';

export function useDocumentModals() {
  const [danfeOpen, setDanfeOpen] = useState(false);
  const [danfeDoc, setDanfeDoc] = useState<AssociatedDoc | null>(null);
  
  const [boletoOpen, setBoletoOpen] = useState(false);
  const [boletoDoc, setBoletoDoc] = useState<AssociatedDoc | null>(null);
  
  const [compOpen, setCompOpen] = useState(false);
  const [compDoc, setCompDoc] = useState<AssociatedDoc | null>(null);

  const [nfseOpen, setNfseOpen] = useState(false);
  const [nfseDoc, setNfseDoc] = useState<AssociatedDoc | null>(null);

  const [cteOpen, setCteOpen] = useState(false);
  const [cteDoc, setCteDoc] = useState<AssociatedDoc | null>(null);

  const openDanfe = (doc: AssociatedDoc) => {
    setDanfeDoc(doc);
    setDanfeOpen(true);
  };

  const closeDanfe = () => {
    setDanfeOpen(false);
    setDanfeDoc(null);
  };

  const openBoleto = (doc: AssociatedDoc) => {
    setBoletoDoc(doc);
    setBoletoOpen(true);
  };

  const closeBoleto = () => {
    setBoletoOpen(false);
    setBoletoDoc(null);
  };

  const openComprovante = (doc: AssociatedDoc) => {
    setCompDoc(doc);
    setCompOpen(true);
  };

  const closeComprovante = () => {
    setCompOpen(false);
    setCompDoc(null);
  };

  const openNFSe = (doc: AssociatedDoc) => {
    setNfseDoc(doc);
    setNfseOpen(true);
  };

  const closeNFSe = () => {
    setNfseOpen(false);
    setNfseDoc(null);
  };

  const openCTe = (doc: AssociatedDoc) => {
    setCteDoc(doc);
    setCteOpen(true);
  };

  const closeCTe = () => {
    setCteOpen(false);
    setCteDoc(null);
  };

  return {
    danfe: { isOpen: danfeOpen, doc: danfeDoc, open: openDanfe, close: closeDanfe },
    boleto: { isOpen: boletoOpen, doc: boletoDoc, open: openBoleto, close: closeBoleto },
    comprovante: { isOpen: compOpen, doc: compDoc, open: openComprovante, close: closeComprovante },
    nfse: { isOpen: nfseOpen, doc: nfseDoc, open: openNFSe, close: closeNFSe },
    cte: { isOpen: cteOpen, doc: cteDoc, open: openCTe, close: closeCTe },
  };
}


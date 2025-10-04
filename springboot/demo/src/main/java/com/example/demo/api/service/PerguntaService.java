package com.example.demo.api.service;

import com.example.demo.api.dto.PerguntaDTO;
import com.example.demo.api.model.PerguntaEntity;
import com.example.demo.api.repository.PerguntaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PerguntaService {

    private final PerguntaRepository perguntaRepository;

    @Transactional(readOnly = true)
    public List<PerguntaDTO> listarTodos() {
        return perguntaRepository.findAll()
                .stream()
                .map(this::mapearParaDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public PerguntaDTO buscarPorId(Integer id) {
        PerguntaEntity entity = perguntaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pergunta não encontrada"));
        return mapearParaDTO(entity);
    }

    @Transactional
    public PerguntaDTO criar(PerguntaDTO perguntaDTO) {
        PerguntaEntity entity = new PerguntaEntity();
        aplicarValores(entity, perguntaDTO);
        PerguntaEntity salvo = perguntaRepository.save(entity);
        return mapearParaDTO(salvo);
    }

    @Transactional
    public PerguntaDTO atualizar(Integer id, PerguntaDTO perguntaDTO) {
        PerguntaEntity existente = perguntaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pergunta não encontrada"));

        aplicarValores(existente, perguntaDTO);
        PerguntaEntity atualizado = perguntaRepository.save(existente);
        return mapearParaDTO(atualizado);
    }

    @Transactional
    public void deletar(Integer id) {
        if (!perguntaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pergunta não encontrada");
        }

        perguntaRepository.deleteById(id);
    }

    private PerguntaDTO mapearParaDTO(PerguntaEntity entity) {
        if (entity == null) {
            return null;
        }

        return PerguntaDTO.builder()
                .codigoPergunta(entity.getCodigoPergunta())
                .pergunta(entity.getPergunta())
                .q1(entity.getQ1())
                .q2(entity.getQ2())
                .q3(entity.getQ3())
                .q4(entity.getQ4())
                .explicacao(entity.getExplicacao())
                .indiceResposta(entity.getIndiceResposta())
                .build();
    }

    private void aplicarValores(PerguntaEntity entity, PerguntaDTO dto) {
        if (dto == null) {
            return;
        }

        entity.setPergunta(dto.getPergunta());
        entity.setQ1(dto.getQ1());
        entity.setQ2(dto.getQ2());
        entity.setQ3(dto.getQ3());
        entity.setQ4(dto.getQ4());
        entity.setExplicacao(dto.getExplicacao());
        entity.setIndiceResposta(dto.getIndiceResposta());
    }
}

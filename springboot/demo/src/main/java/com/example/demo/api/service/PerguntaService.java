package com.example.demo.api.service;

import com.example.demo.api.dto.PerguntaDTO;
import com.example.demo.api.model.PerguntaEntity;
import com.example.demo.api.repository.PerguntaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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


}

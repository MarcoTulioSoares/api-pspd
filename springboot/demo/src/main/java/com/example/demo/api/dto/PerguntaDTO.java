package com.example.demo.api.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerguntaDTO {

    private Integer codigoPergunta;

    private String pergunta;

    private String q1;

    private String q2;

    private String q3;

    private String q4;

    private String explicacao;

    private Integer indiceResposta;
}

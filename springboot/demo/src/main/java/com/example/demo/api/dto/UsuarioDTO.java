package com.example.demo.api.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {

    private Integer codigoUsuario;
    private String email;
    private String senha;
    private Integer pontuacao;
}

package com.example.demo.api.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "TB_USUARIO")
public class UsuarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo_USUARIO", nullable = false, updatable = false,
            columnDefinition = "INT AUTO_INCREMENT")
    private Integer codigoUsuario;

    @Column(name = "EMAIL", nullable = false, length = 500)
    private String email;

    @Column(name = "SENHA", nullable = false, length = 500)
    private String senha;

    @Column(name = "PONTUACAO", nullable = false)
    private Integer pontuacao;

  





}

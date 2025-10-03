package com.example.demo.api.controller;

import com.example.demo.api.dto.PerguntaDTO;

import com.example.demo.api.service.PerguntaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pergunta")
@RequiredArgsConstructor
public class PerguntaController {

    private final PerguntaService perguntaService;

    @GetMapping
    public ResponseEntity<List<PerguntaDTO>> listarTodas() {
        return ResponseEntity.ok(perguntaService.listarTodos());
    }


}

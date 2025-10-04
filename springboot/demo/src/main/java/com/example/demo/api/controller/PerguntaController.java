package com.example.demo.api.controller;

import com.example.demo.api.dto.PerguntaDTO;

import com.example.demo.api.service.PerguntaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{id}")
    public ResponseEntity<PerguntaDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(perguntaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PerguntaDTO> criar(@RequestBody PerguntaDTO perguntaDTO) {
        PerguntaDTO criada = perguntaService.criar(perguntaDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PerguntaDTO> atualizar(@PathVariable Integer id,
                                                 @RequestBody PerguntaDTO perguntaDTO) {
        return ResponseEntity.ok(perguntaService.atualizar(id, perguntaDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        perguntaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

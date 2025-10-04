package com.example.demo.api.service;

import com.example.demo.api.dto.UsuarioDTO;
import com.example.demo.api.model.UsuarioEntity;
import com.example.demo.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::mapearParaDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorId(Integer id) {
        UsuarioEntity entity = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        return mapearParaDTO(entity);
    }

    @Transactional
    public UsuarioDTO criar(UsuarioDTO usuarioDTO) {
        UsuarioEntity entity = new UsuarioEntity();
        aplicarValores(entity, usuarioDTO);
        UsuarioEntity salvo = usuarioRepository.save(entity);
        return mapearParaDTO(salvo);
    }

    @Transactional
    public UsuarioDTO atualizar(Integer id, UsuarioDTO usuarioDTO) {
        UsuarioEntity existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        aplicarValores(existente, usuarioDTO);
        UsuarioEntity atualizado = usuarioRepository.save(existente);
        return mapearParaDTO(atualizado);
    }

    @Transactional
    public void deletar(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
        }

        usuarioRepository.deleteById(id);
    }

    private UsuarioDTO mapearParaDTO(UsuarioEntity entity) {
        if (entity == null) {
            return null;
        }

        return UsuarioDTO.builder()
                .codigoUsuario(entity.getCodigoUsuario())
                .email(entity.getEmail())
                .senha(entity.getSenha())
                .pontuacao(entity.getPontuacao())
                .build();
    }

    private void aplicarValores(UsuarioEntity entity, UsuarioDTO dto) {
        if (dto == null) {
            return;
        }

        entity.setEmail(dto.getEmail());
        entity.setSenha(dto.getSenha());
        entity.setPontuacao(dto.getPontuacao());
    }
}

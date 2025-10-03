package com.example.demo.api.repository;


import com.example.demo.api.model.PerguntaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PerguntaRepository extends JpaRepository<PerguntaEntity, Integer> {
}

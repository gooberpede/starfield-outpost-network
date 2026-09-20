# Glossário de localização em português do Brasil

## Status e escopo

Este documento é a autoridade terminológica para os futuros textos do tracker
em `pt-BR`. Ele orienta a revisão posterior do catálogo semântico, mas não é o
catálogo e não ativa o idioma em tempo de execução.

As formas da Bethesda vêm das identidades qualificadas em
`official-terminology-provenance.csv`. O texto oficial permanece literal no
artefato de valores; uma frase contextual não vira automaticamente um rótulo.
Os termos **tracker** são decisões editoriais próprias do aplicativo.

## Estilo, maiúsculas e gramática

- Usar português brasileiro natural e conciso. Não neutralizar para português
  europeu nem adotar convenções de `pt-PT`.
- Usar caixa de frase na interface e na prosa. A caixa de título da fonte
  oficial (`Vínculo de Carga`, por exemplo) não é uma regra geral. Preservar
  exatamente `Starfield` e a forma oficial brasileira `Tec-X`.
- Ajustar gênero, número, artigos e contrações (`do`, `da`, `no`, `na`, `ao`)
  ao contexto. As formas abaixo são lemas ou rótulos, não fragmentos para
  concatenação mecânica.
- Não encurtar um termo correto apenas para caber na geometria atual.

## Terminologia oficial e decisões de uso

| Conceito em inglês | Classe | Forma preferida | Evidência oficial | Sentido, caixa, uso compacto e restrição |
| --- | --- | --- | --- | --- |
| Outpost | Bethesda oficial | Entreposto | `term.outpost.standalone`, contexto Free Lanes | Construção do jogador. Masculino. Adequado como rótulo; regra semântica com singular/plural. |
| Cargo Link | Bethesda oficial | Vínculo de carga | `term.cargo-link.standalone` = `Vínculo de Carga` | Manter a evidência exata no CSV; usar caixa de frase no tracker. Risco moderado de comprimento. |
| Inter-System Cargo Link | Bethesda oficial | Vínculo de carga entre sistemas | `term.inter-system-cargo-link.standalone` | Vínculo que cruza sistemas e requer He-3. Caixa de frase; risco de comprimento. |
| Inter-System | Oficial contextual | Entre sistemas | `term.inter-system.context-label` | Modificador somente quando o objeto já está claro; não impor globalmente. |
| Biome | Oficial contextual | Bioma | cinco evidências `term.biome.*` | Masculino; plural `biomas`. A caixa varia na fonte conforme o contexto. |
| Planet | Oficial contextual | Planeta | `term.planet.*` | Apenas corpo do tipo planeta; não inclui luas ou orbitais. |
| Planetary Body | Oficial contextual | Corpo celeste | `term.planetary-body.celestial-context` | Abstração inclusiva do tracker. `Corpo planetário` é oficial, mas mais restrito. |
| Star System | Oficial contextual | Sistema estelar | `term.star-system.full-phrase` | `Sistema de Destino` e `sistema Algorab` são formas contextuais. |
| Outpost Management | Bethesda oficial | Gestão de Entrepostos | `skill.outpost-management.name` | Nome de habilidade; preservar a forma oficial quando citar a habilidade. |
| Outpost Engineering | Bethesda oficial | Engenh. de Entrepostos | `skill.outpost-engineering.name` | Nome oficial abreviado; preservar o ponto. |
| Planetary Habitation | Bethesda oficial | Habitação Planetária | `skill.planetary-habitation.name` | Nome de habilidade. |
| Research Methods | Bethesda oficial | Métodos de Pesquisa | `skill.research-methods.name` | Nome de habilidade. |
| Special Projects | Bethesda oficial | Projetos Especiais | `skill.special-projects.name` | Nome de habilidade. |
| X-Tech | Bethesda oficial | Tec-X | `term.x-tech.*` | Forma oficial brasileira invariante; não substituir por `X-Tech`. |
| X-Tech Power Core | Bethesda oficial | Núcleo de energia Tec-X | `term.x-tech-power-core.item-name` = caixa de título | Nome autônomo; caixa de frase no tracker. Risco de comprimento. |
| Starfield | Marca invariante | Starfield | a identidade qualificada contém `Campo Estelar` | A evidência traduz o sentido comum naquele registro, não o título do produto. |
| Moon | Oficial contextual | Lua | `term.moon.satellite-context` | Minúscula em prosa, salvo início de frase. |
| Orbital | Contextual | Conforme a frase | `term.orbital.adjectival-context` | Há apenas evidência adjetiva; não impor substantivo autônomo. |
| Cargo Pad | Ausência oficial | Sem termo visível | quatro linhas `term.cargo-pad.*-absence` | Termo de apresentação aposentado; IDs internos `CargoPad` não mudam. |

### Mapa das fontes de evidência

As identidades exatas (incluindo `StringID` e, quando houver, FormID/campo)
permanecem em `official-terminology-provenance.csv`. Em resumo:

- `Starfield.esm / strings` fornece rótulos autônomos, habilidades e os
  principais contextos de UI; `Starfield.esm / ilstrings` fornece a prosa
  astronômica e outras variantes contextuais;
- `ShatteredSpace.esm / ilstrings` fornece a evidência ambiental de `Biome`;
- `SFBGS00D.esm / strings` fornece o nome qualificado de `Tec-X`;
- `SFBGS050.esm / strings|dlstrings|ilstrings` fornece apenas evidência
  terminológica de Free Lanes, incluindo `X-Tech Power Core`, e nunca entidades
  canônicas do tracker;
- as quatro linhas de ausência de `Cargo Pad` não têm tabela nem `StringID` por
  definição.

## Terminologia do tracker

| Conceito em inglês | Classe | Forma preferida | Sentido e exclusões | Uso compacto e estratégia |
| --- | --- | --- | --- | --- |
| Planned Supply | Tracker | Suprimento planejado | Intenção virtual de fornecimento futuro; não estoque, reserva ou entrega real. | Risco de comprimento; conceito semântico. |
| Present | Contextual | Presença | Existência ou disponibilidade possível/registrada; nunca temporal `atual`. Em frases, `presente` ou `disponível` podem ser naturais. | Rótulo compacto; regra por chave. |
| Producing | Contextual | Em produção | Estado operacional configurado, sem vazão. Ações: `produzir` e `parar de produzir`. | Regra por chave. |
| Inputs | Contextual | Insumos | Recursos exigidos por receitas ou produção orgânica; não campos de entrada de formulário. | Adequado; variantes explicativas permitidas. |
| Logistics | Tracker | Logística | Itens realmente atribuídos a exportações roteadas, não apenas exportáveis. | Adequado; por chave. |
| Manufacturing | Tracker | Fabricação | Produção configurada de produtos a partir de insumos; sem vazão. | Conceito semântico. |
| Validation | Tracker | Validação | Diagnóstico de domínio com erros, avisos e informações. | Conceito semântico. |
| Resource Matrix | Tracker | Matriz de recursos | Visão de presença, produção, insumos e logística. | Risco moderado; frase estável. |
| Reshuffle | Contextual | Reordenar | Entra no modo de ordenação manual; rejeitar `embaralhar`, que implica acaso. | Regra por chave; `Concluir reordenação` ao sair. |
| Lock order / Lock | Contextual | Bloquear a ordem | Encerra ou impede reordenação; não é segurança ou login. | Risco de comprimento; por chave. |
| Inorganic / Organic | Contextual | Inorgânico / Orgânico | Categorias de recursos. Flexionar gênero e número (`recursos inorgânicos`, `matéria orgânica`). | Forma curta só com contexto; variantes permitidas. |
| Network | Tracker | Rede | Documento de entrepostos e vínculos; não necessariamente rede de computadores. | Adequado; conceito semântico. |
| Active Production | Tracker | Produção ativa | Extração, coleta ou fabricação configurada. | Risco moderado; conceito semântico. |
| Source / Destination | Contextual | Origem / Destino | Procedência do recurso e entreposto receptor. Artigos e contrações dependem da frase. | Não impor substring global. |
| Import / Export (JSON) | Contextual | Importar / Exportar | Operações de arquivo sobre a coleção; diferentes dos fluxos de carga. | Verbos de botão por chave. |
| Undo / Redo | Contextual | Desfazer / Refazer | Navegação no histórico de edição da sessão. | Verbos de botão por chave. |
| Error / Warning / Info | Tracker | Erro / Aviso / Informação | Níveis de validação; não transformar aviso em erro. | Flexionar plural nos textos. |

## Conceitos de alto risco para a revisão semântica

Todos exigem contexto adicional para Codex e DeepL:

| Conceitos | Risco | Substring seguro | Variação esperada |
| --- | --- | --- | --- |
| Planned Supply, Active Production, Resource Matrix | Confusão com estoque, vazão ou tabela genérica. | Só em títulos conhecidos. | Artigos e contrações. |
| Present, Producing, Inputs | Sentido temporal, ação genérica ou entrada de dados. | Não. | Estado, verbo, gênero e número. |
| Logistics, Manufacturing, Validation, Network | Ampliar ou restringir o sentido de domínio. | Não globalmente. | Integração natural na frase. |
| Reshuffle, Lock, Undo, Redo | Acaso, segurança ou comando histórico incorreto. | Só rótulos por chave. | Imperativo e infinitivo. |
| Source, Destination | Confusão com origem de código/dados. | Não. | `da origem`, `no destino`, `ao destino`. |

## Tokens protegidos e riscos compactos

Preservar parâmetros (`{count}`), `He-3`, `JSON`, `FormID`, IDs, extensões,
teclas, `Starfield` e `Tec-X`. Têm risco compacto `Vínculo de carga entre
sistemas`, `Núcleo de energia Tec-X`, `Suprimento planejado`, `Matriz de
recursos` e `Bloquear a ordem`. A mitigação física fica para o QA posterior;
esta etapa não altera geometria.

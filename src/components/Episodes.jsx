import { useEffect, useState } from "react";
import axios from "axios";
import "./Episodes.scss";

const Episodes = () => {
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = localStorage.getItem("episodeData");
        if (storedData) {
          setEpisodes(JSON.parse(storedData));
        } else {
          const response = await axios.get("https://rickandmortyapi.com/api/episode");
          const episodesData = response.data.results;

          const characterCache = new Map();
          const episodePromises = episodesData.map(async (episode) => {
            const characterUrls = episode.characters.slice(0, 10);
            const characterPromises = characterUrls.map(async (url) => {
              if (characterCache.has(url)) {
                return characterCache.get(url);
              } else {
                try {
                  const characterResponse = await axios.get(url);
                  const character = characterResponse.data;
                  characterCache.set(url, { name: character.name, species: character.species });
                  return { name: character.name, species: character.species };
                } catch (error) {
                  console.error(`Error fetching character data for URL: ${url}`);
                  return null;
                }
              }
            });
            const characters = await Promise.all(characterPromises);
            return { episode: episode, characters: characters };
          });

          const episodeResults = await Promise.all(episodePromises);
          setEpisodes(episodeResults);
          localStorage.setItem("episodeData", JSON.stringify(episodeResults));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const getCharactersFromEpisode = (episode) => {
    const characters = episode.characters
      .filter((character) => character !== null) // Filtrar personajes nulos
      .map((character) => ({
        name: character.name,
        species: character.species,
      }));
    return characters;
  };

  return (
    <div className="episodes">
      {episodes.map((episodeResult, index) => (
        <div key={index} className="episode-card">
          <h2 className="episode-title">
            {index + 1}. {episodeResult.episode.name} - {episodeResult.episode.episode}
          </h2>
          <p className="episode-air-date">Fecha al aire: {episodeResult.episode.air_date}</p>
          <h3 className="episode-characters-title">Personajes:</h3>
          <ul className="episode-characters-list">
            {getCharactersFromEpisode(episodeResult).map((character, index) => (
              <li key={index} className="episode-character">
                {index + 1}. {character.name} - {character.species}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Episodes;

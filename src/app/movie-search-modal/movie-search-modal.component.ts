import { Component, Input } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecommendationsResult } from 'src/models/movie-details.model';

@Component({
  selector: 'app-movie-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './movie-search-modal.component.html',
  styleUrls: ['./movie-search-modal.component.scss'],
})
export class MovieSearchModalComponent {
  @Input() watchlist: RecommendationsResult[] = [];

  searchQuery: string = '';
  filteredMovies: RecommendationsResult[] = [];
  private searchTimeout: any;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) { }

  dismiss() {
    this.modalController.dismiss();
  }

  // Called on every keystroke (ionInput)
  searchMovies() {
    if (!this.searchQuery.trim()) {
      this.filteredMovies = [];
      return;
    }

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce: wait 500ms after user stops typing
    this.searchTimeout = setTimeout(() => {
      const query = encodeURIComponent(this.searchQuery.trim());
      const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=true`;

      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0M2YzZDM0N2IxNzU2YmUyMjI1MGY4MGQ1ODAyOTEwMSIsIm5iZiI6MTczNjczNDg1Ny42OTIsInN1YiI6IjY3ODQ3ODg5MjI1NjAyM2RmZDRlNjAyNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KfGGPJNVAJfMUKgZOkZvP44qJI_Id8ZtgnK-YFz1p4Q'
        }
      };

      fetch(url, options)
        .then((res) => res.json())
        .then((data) => {
          const results = data.results || [];
          this.filteredMovies = results
            .map((r: any): RecommendationsResult => ({
              backdrop_path: r.backdrop_path,
              id: r.id,
              title: r.title,
              original_title: r.original_title,
              overview: r.overview,
              poster_path: r.poster_path
                ? r.poster_path
                : 'assets/placeholder.png',
              media_type: r.media_type,
              adult: r.adult,
              original_language: r.original_language,
              genre_ids: r.genre_ids,
              popularity: r.popularity,
              release_date: new Date(r.release_date),
              video: r.video,
              vote_average: r.vote_average,
              vote_count: r.vote_count,
            }))
            .filter((movie: RecommendationsResult) =>
              !this.watchlist.some((w: RecommendationsResult) => w.title === movie.title)
            );
        })
        .catch((err) => {
          console.error(err);
          this.filteredMovies = [];
        });
    }, 500);
  }

  async addMovie(movie: RecommendationsResult): Promise<void> {
    if (this.watchlist.some((w: RecommendationsResult) => w.title === movie.title)) {
      const toast = await this.toastController.create({
        message: `${movie.title} is already in your Watchlist.`,
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
    } else {
      this.modalController.dismiss(movie);
      const toast = await this.toastController.create({
        message: `${movie.title} added to Watchlist!`,
        duration: 2000,
      });
      await toast.present();
    }

    this.filteredMovies = this.filteredMovies.filter(
      (m: RecommendationsResult) => m.title !== movie.title
    );
  }
}
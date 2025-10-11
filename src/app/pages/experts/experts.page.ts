import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, map, switchMap, combineLatest, BehaviorSubject, shareReplay } from 'rxjs';
import { AdminDataService, Expert, Category } from '../../services/admin-data.service';

@Component({
  selector: 'app-experts',
  templateUrl: './experts.page.html',
  styleUrls: ['./experts.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
})
export class ExpertsPage implements OnInit {
  experts$!: Observable<Expert[]>;
  categoryId$!: Observable<string | null>;
  categories$!: Observable<Category[]>;
  filteredExperts$!: Observable<Expert[]>;
  categoryNameMap$!: Observable<Record<string, string>>;

  searchTerm = '';
  private searchTerm$ = new BehaviorSubject<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private data: AdminDataService
  ) {}

  ngOnInit() {
    // Charger les catégories (cache)
    this.categories$ = this.data.getCategories$().pipe(shareReplay(1));
    this.categoryNameMap$ = this.categories$.pipe(
      map((cats) => {
        const mapObj: Record<string, string> = {};
        for (const c of cats) mapObj[c.id] = c.name;
        return mapObj;
      }),
      shareReplay(1)
    );

    // Observer le paramètre categoryId dans l'URL
    this.categoryId$ = this.route.queryParamMap.pipe(
      map(params => params.get('categoryId'))
    );

    // Charger les experts selon la catégorie
    this.experts$ = this.categoryId$.pipe(
      switchMap((categoryId) => {
        if (categoryId) {
          return this.data.getExpertsByCategory$(categoryId);
        }
        return this.data.getExperts$();
      })
    );

    // Appliquer le filtre de recherche
    this.filteredExperts$ = combineLatest([
      this.experts$,
      this.searchTerm$
    ]).pipe(
      map(([experts, searchTerm]) => {
        if (!searchTerm.trim()) {
          return experts;
        }
        const term = searchTerm.toLowerCase();
        return experts.filter(expert =>
          expert.name.toLowerCase().includes(term) ||
          expert.email.toLowerCase().includes(term) ||
          expert.bio.toLowerCase().includes(term)
        );
      })
    );
  }

  onSearch() {
    this.searchTerm$.next(this.searchTerm);
  }

  viewExpertDetails(expert: Expert) {
    // TODO: Naviguer vers la page de détails de l'expert
    console.log('View expert details:', expert);
    // this.router.navigate(['/expert-details', expert.id]);
  }

  bookConsultation(expert: Expert, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/booking'], { queryParams: { expertId: expert.id } });
  }

  trackByExpert(index: number, e: Expert) {
    return e.id;
  }
}
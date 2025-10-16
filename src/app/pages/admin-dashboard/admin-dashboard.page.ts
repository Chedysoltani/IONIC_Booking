import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminDataService, Category, Expert, UserDoc } from '../../services/admin-data.service';
import { Booking } from '../../services/booking';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  activeTab = 'stats';

  // Statistics
  categoriesCount = 0;
  expertsCount = 0;
  usersCount = 0;
  bookingsCount = 0;

  // Categories
  categories: Category[] = [];
  isCategoryModalOpen = false;
  editingCategory: Category | null = null;
  categoryForm = {
    name: '',
    description: ''
  };

  // Experts
  experts: Expert[] = [];
  isExpertModalOpen = false;
  editingExpert: Expert | null = null;
  expertForm = {
    name: '',
    email: '',
    bio: '',
    categoryId: ''
  };

  // Users
  users: UserDoc[] = [];
  editingUser: UserDoc | null = null;
  isUserModalOpen = false;
  userForm = {
    displayName: '',
    email: '',
    role: 'user' as 'user' | 'admin'
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private adminDataService: AdminDataService,
    private bookingService: Booking
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadData() {
    // Load categories
    this.subscriptions.push(
      this.adminDataService.getCategories$().subscribe({
        next: (categories) => {
          this.categories = categories;
          this.updateStatistics();
        },
        error: () => this.showToast('Erreur lors du chargement des catégories', 'danger')
      })
    );

    // Load experts
    this.subscriptions.push(
      this.adminDataService.getExperts$().subscribe({
        next: (experts) => {
          this.experts = experts;
          this.updateStatistics();
        },
        error: () => this.showToast('Erreur lors du chargement des experts', 'danger')
      })
    );

    // Load users
    this.subscriptions.push(
      this.adminDataService.getUsers$().subscribe({
        next: (users) => {
          this.users = users;
          this.updateStatistics();
        },
        error: () => this.showToast('Erreur lors du chargement des utilisateurs', 'danger')
      })
    );

    // Load bookings count
    this.adminDataService.getBookingsCount().then(count => {
      this.bookingsCount = count;
      this.updateStatistics();
    }).catch(() => {
      this.showToast('Erreur lors du chargement du nombre de réservations', 'danger');
    });
  }

  updateStatistics() {
    this.categoriesCount = this.categories.length;
    this.expertsCount = this.experts.length;
    this.usersCount = this.users.length;
  }

  onTabChange() {
    // Animation lors du changement d'onglet
  }

  // ===== CATEGORY CRUD =====
  openCategoryModal() {
    this.editingCategory = null;
    this.categoryForm = { name: '', description: '' };
    this.isCategoryModalOpen = true;
  }

  closeCategoryModal() {
    this.isCategoryModalOpen = false;
    this.editingCategory = null;
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.categoryForm = {
      name: category.name,
      description: category.description
    };
    this.isCategoryModalOpen = true;
  }

  async saveCategory() {
    if (!this.categoryForm.name || !this.categoryForm.description) {
      this.showToast('Veuillez remplir tous les champs', 'warning');
      return;
    }

    try {
      if (this.editingCategory) {
        // Update
        await this.adminDataService.updateCategory(this.editingCategory.id!, {
          name: this.categoryForm.name,
          description: this.categoryForm.description
        });
        this.showToast('Catégorie mise à jour avec succès', 'success');
      } else {
        // Create
        await this.adminDataService.addCategory({
          name: this.categoryForm.name,
          description: this.categoryForm.description
        });
        this.showToast('Catégorie créée avec succès', 'success');
      }

      this.closeCategoryModal();
    } catch (error) {
      this.showToast('Erreur lors de la sauvegarde', 'danger');
    }
  }

  async deleteCategory(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.adminDataService.deleteCategory(id);
              this.showToast('Catégorie supprimée', 'success');
            } catch (error) {
              this.showToast('Erreur lors de la suppression', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteUser(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.adminDataService.deleteUser(id);
              this.showToast('Utilisateur supprimé', 'success');
            } catch (error) {
              this.showToast('Erreur lors de la suppression', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // ===== EXPERT CRUD =====
  openExpertModal() {
    this.editingExpert = null;
    this.expertForm = { name: '', email: '', bio: '', categoryId: '' };
    this.isExpertModalOpen = true;
  }

  closeExpertModal() {
    this.isExpertModalOpen = false;
    this.editingExpert = null;
  }

  editExpert(expert: Expert) {
    this.editingExpert = expert;
    this.expertForm = {
      name: expert.name,
      email: expert.email,
      bio: expert.bio,
      categoryId: expert.categoryId
    };
    this.isExpertModalOpen = true;
  }

  async saveExpert() {
    if (!this.expertForm.name || !this.expertForm.email || !this.expertForm.categoryId) {
      this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    try {
      if (this.editingExpert) {
        // Update
        await this.adminDataService.updateExpert(this.editingExpert.id!, {
          name: this.expertForm.name,
          email: this.expertForm.email,
          bio: this.expertForm.bio,
          categoryId: this.expertForm.categoryId
        });
        this.showToast('Expert mis à jour avec succès', 'success');
      } else {
        // Create
        await this.adminDataService.addExpert({
          name: this.expertForm.name,
          email: this.expertForm.email,
          bio: this.expertForm.bio,
          categoryId: this.expertForm.categoryId
        });
        this.showToast('Expert créé avec succès', 'success');
      }

      this.closeExpertModal();
    } catch (error) {
      this.showToast('Erreur lors de la sauvegarde', 'danger');
    }
  }

  async deleteExpert(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cet expert ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.adminDataService.deleteExpert(id);
              this.showToast('Expert supprimé', 'success');
            } catch (error) {
              this.showToast('Erreur lors de la suppression', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  }

  // ===== USER CRUD =====
  openUserModal() {
    this.editingUser = null;
    this.userForm = { displayName: '', email: '', role: 'user' };
    this.isUserModalOpen = true;
  }

  closeUserModal() {
    this.isUserModalOpen = false;
    this.editingUser = null;
  }

  editUser(user: UserDoc) {
    this.editingUser = user;
    this.userForm = {
      displayName: user.displayName || '',
      email: user.email || '',
      role: (user.role as 'user' | 'admin') || 'user'
    };
    this.isUserModalOpen = true;
  }

  async saveUser() {
    if (!this.userForm.displayName || !this.userForm.email) {
      this.showToast('Veuillez renseigner le nom et l\'email', 'warning');
      return;
    }

    try {
      if (this.editingUser) {
        await this.adminDataService.updateUser(this.editingUser.id, {
          displayName: this.userForm.displayName,
          email: this.userForm.email,
          role: this.userForm.role
        });
        this.showToast('Utilisateur mis à jour', 'success');
      } else {
        await this.adminDataService.addUser({
          displayName: this.userForm.displayName,
          email: this.userForm.email,
          role: this.userForm.role,
          createdAt: new Date()
        });
        this.showToast('Utilisateur ajouté avec succès', 'success');
      }
      this.closeUserModal();
    } catch (error) {
      this.showToast('Erreur lors de la sauvegarde de l\'utilisateur', 'danger');
    }
  }
  async toggleUserRole(user: UserDoc) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const alert = await this.alertController.create({
      header: 'Changer le rôle',
      message: `Changer le rôle de ${user.displayName} à ${newRole} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: newRole === 'admin' ? 'Passer en Admin' : 'Passer en User',
          handler: async () => {
            try {
              await this.adminDataService.updateUserRole(user.id!, newRole);
              this.showToast('Rôle mis à jour', 'success');
            } catch (error) {
              this.showToast('Erreur lors de la mise à jour du rôle', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  //async deleteUser(id: string) {
    //const alert = await this.alertController.create({
      //header: 'Confirmer la suppression',
      //message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      //buttons: [
        //{
          //text: 'Annuler',
          //role: 'cancel'
       // },
        //{
          //text: 'Supprimer',
          //role: 'destructive',
          //handler: async () => {
           // try {
//await this.adminDataService.deleteUser(id);
             // this.showToast('Utilisateur supprimé', 'success');
            //} catch (error) {
              //this.showToast('Erreur lors de la suppression', 'danger');
            //}
          //}
        //}
      //]
    //});

    //await alert.present();
  //}

  // ===== UTILITIES =====
  async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  async backfillBookingsUsers() {
    try {
      const res = await this.bookingService.backfillUsersOnBookings();
      await this.showToast(`Backfill terminé: total=${res.total}, mis à jour=${res.updated}, ignorés=${res.skipped}, erreurs=${res.errors}`, 'success');
    } catch (e) {
      await this.showToast('Erreur lors du backfill des réservations', 'danger');
    }
  }

  logout() {
    // TODO: Implémenter la déconnexion
    this.router.navigateByUrl('/login');
  }
}
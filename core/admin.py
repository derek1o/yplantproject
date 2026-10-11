from django.contrib import admin
from .models import Interest


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "interests_summary", "location", "created_at")
    list_filter = ("location", "created_at")
    search_fields = ("name", "email", "phone", "interests", "note")
    readonly_fields = ("created_at",)
    list_per_page = 100
    date_hierarchy = "created_at"

    fieldsets = (
        ("Contact", {"fields": ("name", "email", "phone")}),
        ("Interests", {"fields": ("interests", "location", "note")}),
        ("Meta", {"fields": ("created_at",)}),
    )

    @admin.display(description="Interests")
    def interests_summary(self, obj):
        return ", ".join(obj.interest_list()) or "-"
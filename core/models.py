from django.db import models

class Interest(models.Model):
    """
    A public expression of interest. No account required, but contact
    details are required so we can follow up.
    """

    LOCATION_CHOICES = [
        ("newport", "Newport"),
        ("unsure", "Not sure yet"),
    ]

    INTEREST_CHOICES = [
        ("photography", "Photography"),
        ("videography", "Videography"),
        ("drones", "Drones"),
        ("editing", "Editing & Post-Production"),
        ("social", "Social Media Content"),
        ("coding", "Coding & Web Development"),
        ("other", "Other"),
    ]

    # --- Contact details (all required) ---
    name = models.CharField(max_length=120,help_text="Your name.",)
    email = models.EmailField(help_text="We'll use this to send you programme details.",)
    phone = models.CharField(max_length=15,help_text="A phone number we can reach you on.",default='-')

    # --- Interests (required) ---
    interests = models.CharField(max_length=200,help_text="Comma-separated list of interests.",)

    # --- Optional ---
    location = models.CharField(max_length=20,choices=LOCATION_CHOICES,default="unsure",)
    note = models.TextField(blank=True,
                            help_text="Anything else you'd like us to know? (optional)",)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Interest"
        verbose_name_plural = "Interests"

    def __str__(self):
        return f"{self.name} - {self.interests}"

    def interest_list(self):
        """Return the selected interests as a list."""
        return [i.strip() for i in self.interests.split(",") if i.strip()]
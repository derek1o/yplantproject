from django import forms
from .models import Interest


class InterestForm(forms.ModelForm):
    """
    Public interest form. Contact details are required so the team
    can reach out; interests are required because that's the point.
    """

    interests = forms.MultipleChoiceField(
        choices=Interest.INTEREST_CHOICES,
        widget=forms.CheckboxSelectMultiple,
        label="What are you interested in?",
        help_text="Tick everything that appeals - no wrong answers.",
    )

    class Meta:
        model = Interest
        fields = ["name", "email", "phone", "interests", "location", "note"]
        widgets = {
            "name": forms.TextInput(
                attrs={
                    "placeholder": "e.g. Sarah Jones",
                    "autocomplete": "name",
                }
            ),
            "email": forms.EmailInput(
                attrs={
                    "placeholder": "you@example.com",
                    "autocomplete": "email",
                }
            ),
            "phone": forms.TextInput(
                attrs={
                    "placeholder": "e.g. 07700 900123",
                    "autocomplete": "tel",
                    "inputmode": "tel",
                }
            ),
            "note": forms.Textarea(
                attrs={
                    "rows": 3,
                    "placeholder": "Anything else? (optional)",
                }
            ),
        }

    def clean_interests(self):
        selected = self.cleaned_data["interests"]
        if not selected:
            raise forms.ValidationError("Please select at least one interest.")
        if isinstance(selected, str):
            selected = [s.strip() for s in selected.split(",") if s.strip()]
        return ",".join(selected)

    def clean_email(self):
        return (self.cleaned_data.get("email") or "").strip().lower()

    def clean_phone(self):
        """Light validation - accept digits, spaces, +, -, and parentheses."""
        phone = (self.cleaned_data.get("phone") or "").strip()
        if not phone:
            raise forms.ValidationError("Please enter a phone number.")

        digits = "".join(c for c in phone if c.isdigit())
        if len(digits) < 7:
            raise forms.ValidationError(
                "Please enter a valid phone number (at least 7 digits)."
            )

        return phone

    def clean_name(self):
        name = (self.cleaned_data.get("name") or "").strip()
        if not name:
            raise forms.ValidationError("Please enter your name.")
        return name
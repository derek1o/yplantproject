import json

from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.views.decorators.http import require_POST

from .forms import InterestForm


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------




# ------------------------------------------------------------------
# Views
# ------------------------------------------------------------------
def home(request):
    return render(request, "core/home.html")


def express_interest(request):
    """Server-rendered form. Works even with JavaScript disabled."""
    if request.method == "POST":
        form = InterestForm(request.POST)
        if form.is_valid():
            interest = form.save()
            _notify_admin(interest)
            _thank_submitter(interest)
            return redirect("interest_success")
    else:
        form = InterestForm()

    return render(request, "core/interest.html", {"form": form})


def interest_success(request):
    return render(request, "core/interest_success.html")


def _thank_submitter(interest):
    """Send a friendly confirmation, only if they left an email."""
    if not interest.email:
        return

    try:
        send_mail(
            subject="Thanks for your interest - Y Plant Affricanaidd CIC",
            message=(
                f"Hi {interest.name or 'there'},\n\n"
                f"Thanks for telling us what you're interested in! "
                f"You picked: {', '.join(interest.interest_list())}.\n\n"
                f"We'll be in touch as soon as session dates are confirmed.\n\n"
                f"Y Plant Affricanaidd CIC"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[interest.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"[email] Could not send thank-you: {e}")


@require_POST
def express_interest_ajax(request):
    """JSON endpoint used by the JavaScript layer."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "Invalid JSON."}, status=400)

    form = InterestForm(data)
    if not form.is_valid():
        return JsonResponse(
            {"ok": False, "errors": form.errors.get_json_data()}, status=400
        )

    interest = form.save()
    _notify_admin(interest)
    _thank_submitter(interest)

    return JsonResponse({"ok": True, "redirect": "/interest/success/"})




def _notify_admin(interest):
    """Email the CIC team whenever someone submits their interests.
    Failures are logged but do not break the submission."""
    try:
        message = render_to_string("emails/notification.txt", {"interest": interest})
    except Exception as e:
        # Fall back to a plain-text message if the template is missing
        print(f"[email] Could not render template: {e}")
        message = (
            f"New interest submission received.\n\n"
            f"Name: {interest.name or '- (anonymous)'}\n"
            f"Email: {interest.email or '- (not provided)'}\n"
            f"Location: {interest.get_location_display()}\n"
            f"Interests: {interest.interests}\n"
            f"Note: {interest.note or 'None'}\n\n"
            f"Submitted: {interest.created_at}"
        )

    send_mail(
        subject=f"New interest submission: {interest.name or 'Anonymous'}",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.ADMIN_NOTIFICATION_EMAIL],
        fail_silently=True,
    )
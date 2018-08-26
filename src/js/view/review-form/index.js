import Review from '../../model/review';
import '../../../sass/components/_review-form.sass';

class ReviewForm {
  get rating() {
    return (this.state.rating + 1);
  }
  constructor(props = null, el = null) {
    this.props = props || {};
    this.state = {
      review: this.props.review = new Review(),
    };
    this.el = el || document.createElement('div');
    this.render = this.render.bind(this);
    this.setup();
  }

  setState(newState) {
    let mergedState = { ...this.state };
    let newValue = null;
    let newInnerValue = null;
    for (const key of Object.keys(newState)) {
      newValue = newState[key];
      if (typeof newValue === 'object' && Object.keys(newValue).length > 0) {
        for (const innerKey of Object.keys(newValue)) {
          newInnerValue = newValue[innerKey];
          mergedState[key][innerKey] = newInnerValue;
        }
      } else {
        mergedState[key] = newValue;
      }
    }
    this.state = mergedState;
    this.stateDidChange(mergedState);
  }

  setup() {
    this.el.className = 'review-form';
    this.form = document.createElement('form');
    this.el.appendChild(this.form);
    this.form.innerHTML = '';
    this.form.addEventListener('submit', this.onSubmit.bind(this));
    this.form.addEventListener('keyup', this.onChangeForm.bind(this));
    this.nameEl = this.createInputElement('name', 'text', 'Name', { limit: { min: 3, max: 128 }, autocomplete: 'name', spellcheck: false, required: true, });
    this.emailEl = this.createInputElement('email', 'email', 'Email', { limit: { min: 3, max: 128 }, autocomplete: 'email', spellcheck: false, required: true, });
    this.ratingEl = this.createInputElement('rating', 'range', 'Rating', { range: { loc: 1, length: 5 } });
    this.ratingEl.classList.add('review-form-star-rating');
    this.ratingEl.setAttribute('aria-label', 'Star rating');
    this.ratingEl.setAttribute('data-rating', 1);
    this.commentsEl = this.createInputElement('comments', 'textarea', 'Comments', { limit: { min: 3, max: 255 }, required: true, autocomplete: false, spellcheck: true });
    [
      this.nameEl,
      this.emailEl,
      this.ratingEl,
      this.commentsEl,
      (() => { const el = document.createElement('button'); el.innerText = 'Submit'; return el; })(),
    ].forEach(el => this.form.appendChild(el));
    this.render();
  }

  // State Events
  stateDidChange(newState) {
    this.render();
  }

  // Handlers

  onChangeForm(e) {
    e.preventDefault();
    const { value, name } = e.target;
    let review = {};
    switch (name) {
      case 'name': {
        review.name = value || '';
        break;
      }
      case 'email': {
        review.email = value || '';
        break;
      }
      case 'rating': {
        let parsedValue = parseInt(value, 0);
        parsedValue = (parsedValue === 0) ? 1 : parsedValue;
        review.rating = parsedValue;
        break;
      }
      case 'comments': {
        review.comments = value || '';
        break;
      }
      default: break;
    }
    if (Object.keys(review).length > 0) {
      this.setState({ review });
    }
  }

  onSubmit(e) {
    e.preventDefault();
    const { review } = this.state;
    this.props.onSubmitHandler(e, review);
  }

  // Validation
  // TODO: Form Input Validation

  // Render
  render() {
    const { review: {
      name = '',
      email = '',
      comments = '',
      rating = 1,
    },
   } = this.state;
    this.nameEl.value = name;
    this.emailEl.value = email;
    this.commentsEl.innerText = comments;
    // this.ratingEl.value = rating - 1;
    this.ratingEl.setAttribute('data-rating', rating || 1);
  }

  // Helpers
  createInputElement(name, type, label, options) {
    const el = document.createElement(((type === 'textarea') ? 'textarea' : 'input'));
    el.id = name;
    el.name = name;
    el.placeholder = label;
    el.setAttribute('aria-label', label);
    el.setAttribute('type', type);
    const { autocomplete, spellcheck, required, range = null, limit = null } = options;
    el.autocomplete = autocomplete;
    el.spellcheck = spellcheck || false;
    el.required = required || false;
    if (type === 'range') {
      el.value = 0; // initial value
      el.min = range.loc;
      el.max = range.length;
      el.addEventListener('change', this.onChangeForm.bind(this));
    }
    if (limit) {
      el.minLength = limit.min;
      el.maxLength = limit.max;
    }
    return el;
  }
}

export default ReviewForm;

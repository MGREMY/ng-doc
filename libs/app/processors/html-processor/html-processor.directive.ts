import {ComponentRef, Directive, ElementRef, Type, ViewContainerRef} from '@angular/core';
import {NgDocMarkdownDirective} from '@ng-doc/app/directives/markdown';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

/**
 * Base processor class to create a processor directive that will be used to replace
 * html nodes with an Angular component.
 */
@Directive()
@UntilDestroy()
export abstract class NgDocHtmlProcessor<T> {
	private componentRefs: Array<ComponentRef<T>> = [];

	protected constructor(
		protected readonly elementRef: ElementRef<HTMLElement>,
		protected readonly viewContainerRef: ViewContainerRef,
		protected readonly markdown: NgDocMarkdownDirective,
		protected readonly selector: string,
		protected readonly component: Type<T>,
	) {
		this.markdown.rendered.pipe(untilDestroyed(this)).subscribe(() => {
			let elementNode: Element | null = null;

			// clear previous demo references
			this.componentRefs.forEach((ref: ComponentRef<T>) => ref.destroy());
			this.componentRefs = [];

			while ((elementNode = this.elementRef.nativeElement.querySelector(this.selector))) {
				if (elementNode) {
					const options: Partial<T> = this.extractComponentOptions(elementNode);

					// create component
					const componentRef: ComponentRef<T> = this.viewContainerRef.createComponent(this.component);

					// set component options
					Object.assign(componentRef.instance, options);

					// add component reference to the list to destroy it later
					this.componentRefs.push(componentRef);

					// replace element node with component node
					elementNode.parentNode?.replaceChild(componentRef.location.nativeElement, elementNode);
				}
			}
		});
	}

	protected abstract extractComponentOptions(element: Element): Partial<T>;
}

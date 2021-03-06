//
//  ACRShowCardTarget
//  ACRShowCardTarget.mm
//
//  Copyright © 2017 Microsoft. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ACRShowCardTarget.h"
#import "ACRRendererPrivate.h"
#import "ACOHostConfigPrivate.h"
#import "ACRContentHoldingUIView.h"
#import "ACRIBaseInputHandler.h"
#import "ACOBaseActionElementPrivate.h"
#import "ACRView.h"
#import "BaseActionElement.h"

@implementation ACRShowCardTarget
{
    std::shared_ptr<AdaptiveCards::AdaptiveCard> _adaptiveCard;
    ACOHostConfig *_config;
    __weak UIView<ACRIContentHoldingView> *_superview;
    __weak ACRView *_rootView;
    __weak UIView *_adcView;
    __weak UIButton *_button;
    ACOBaseActionElement *_actionElement;
}

- (instancetype)initWithActionElement:(std::shared_ptr<AdaptiveCards::ShowCardAction> const &)showCardActionElement
                              config:(ACOHostConfig *)config
                           superview:(UIView<ACRIContentHoldingView> *)superview
                            rootView:(ACRView *)rootView
                               button:(UIButton *)button
{
    self = [super init];
    if(self)
    {
        _adaptiveCard = showCardActionElement->GetCard();
        _config = config;
        _superview = superview;
        _rootView = rootView;
        _adcView = nil;
        _button = button;
        std::shared_ptr<ShowCardAction> showCardAction = std::make_shared<ShowCardAction>();
        showCardAction->SetCard(showCardActionElement->GetCard());
        _actionElement = [[ACOBaseActionElement alloc]initWithBaseActionElement:std::dynamic_pointer_cast<BaseActionElement>(showCardAction)];
    }
    return self;
}

- (void)createShowCard:(NSMutableArray*)inputs
{
    [inputs setArray:[NSMutableArray arrayWithArray:[[_rootView card] getInputs]]];
    if(!inputs){
        inputs = [[NSMutableArray alloc] init];
    }
    ACRColumnView *containingView = [[ACRColumnView alloc] initWithFrame:_rootView.frame];
    UIView *adcView = [ACRRenderer renderWithAdaptiveCards:_adaptiveCard
                                                    inputs:inputs
                                                  context:_rootView
                                           containingView:containingView
                                                hostconfig:_config];
    [[_rootView card] setInputs:inputs];
    unsigned int padding = [_config getHostConfig] ->GetActions().showCard.inlineTopMargin;

        ACRContentHoldingUIView *wrappingView = [[ACRContentHoldingUIView alloc] init];
    [wrappingView addSubview:adcView];

    NSString *horString = [[NSString alloc] initWithFormat:@"H:|-0-[adcView]-0-|"];
    NSString *verString = [[NSString alloc] initWithFormat:@"V:|-%u-[adcView]-0-|",
                           padding];
    NSDictionary *dictionary = NSDictionaryOfVariableBindings(wrappingView, adcView);
    NSArray *horzConst = [NSLayoutConstraint constraintsWithVisualFormat:horString
                                                                 options:0
                                                                 metrics:nil
                                                                   views:dictionary];
    NSArray *vertConst = [NSLayoutConstraint constraintsWithVisualFormat:verString
                                                                 options:0
                                                                 metrics:nil
                                                                   views:dictionary];
    [wrappingView addConstraints:horzConst];
    [wrappingView addConstraints:vertConst];
    _adcView = wrappingView;

    ContainerStyle containerStyle = ([_config getHostConfig]->GetAdaptiveCard().allowCustomStyle)? _adaptiveCard->GetStyle() : [_config getHostConfig]->GetActions().showCard.style;

    ACRContainerStyle style = (ACRContainerStyle)(containerStyle);

    if(style == ACRNone) {
        style = [_superview style];
    }

    wrappingView.translatesAutoresizingMaskIntoConstraints = NO;
    wrappingView.backgroundColor = [_config getBackgroundColorForContainerStyle:style];

    [_superview addArrangedSubview:_adcView];
    _adcView.hidden = YES;
}

- (IBAction)toggleVisibilityOfShowCard
{
    BOOL hidden = _adcView.hidden;
    [_superview hideAllShowCards];
    _adcView.hidden = (hidden == YES)? NO: YES;
    if ([_rootView.acrActionDelegate respondsToSelector:@selector(didChangeVisibility: isVisible:)])
    {
        [_rootView.acrActionDelegate didChangeVisibility:_button isVisible:(!_adcView.hidden)];
    }

    if([_rootView.acrActionDelegate respondsToSelector:@selector(didChangeViewLayout:newFrame:)] && _adcView.hidden == NO){
        CGRect showCardFrame = _adcView.frame;
        showCardFrame.origin = [_adcView convertPoint:_adcView.frame.origin toView:nil];
        CGRect oldFrame = showCardFrame;
        oldFrame.size.height = 0;
        showCardFrame.size.height += [_config getHostConfig]->GetActions().showCard.inlineTopMargin;;
        [_rootView.acrActionDelegate didChangeViewLayout:oldFrame newFrame:showCardFrame];
    }
    [_rootView.acrActionDelegate didFetchUserResponses:[_rootView card] action:_actionElement];
}

- (void)doSelectAction
{
    [self toggleVisibilityOfShowCard];
}

- (void)hideShowCard
{
    _adcView.hidden = YES;
    if ([_rootView.acrActionDelegate respondsToSelector:@selector(didChangeVisibility: isVisible:)])
    {
        [_rootView.acrActionDelegate didChangeVisibility:_button isVisible:(!_adcView.hidden)];
    }
}

@end
